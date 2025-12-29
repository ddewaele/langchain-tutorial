# Todo 1 — Analysis of badcode.txt

Goal: Understand the current behavior, responsibilities, and issues in badcode.txt.

Source file: badcode.txt (original code included below)

---

Summary of what the code does

- Exports an async function updateUserProfile(req, deps) that performs user profile updates.
- It retrieves the actor (who performs the action) and the target user from a provided Db interface.
- Performs authorization: allows admin or self-edit only.
- Can update email (with validation and a rule that only admins can change email domain).
- Can change role (makeAdmin boolean) — only admins allowed.
- Optionally sends a welcome email after updates.
- Uses a Logger for info/warn/error and returns {ok:true} or {ok:false, error:string}.

Identified responsibilities mixed in one function

- Input validation (missing fields, invalid email)
- Authentication/authorization (actor lookup, role checks, self-edit logic)
- Business rules (domain-change restriction)
- Persistence (db.updateUser calls)
- Side effects (sending emails)
- Error handling and logging

Problems and risks

1. Single function has too many responsibilities (violates SRP). Hard to test and reason about.
2. Repeated patterns for db.updateUser try/catch with duplicated error strings.
3. Authorization and business rules are interleaved and not clearly expressed.
4. Email validation is simplistic and implemented inline.
5. Side effects (mailer) are executed mid-flow; failures lead to overall failure in a way that may not be desired.
6. Logger usage is scattered and inconsistent; messages are duplicated in different branches.
7. No clear error types: plain strings are returned which makes programmatic handling harder.
8. No unit tests provided.
9. No separation of pure logic vs I/O — difficult to unit test business logic without mocking.
10. Edge-cases: target email domain parsing uses split and assumes a domain exists; if email has no '@' split yields odd results but earlier validation prevents missing '@' only when updating email — if target has malformed email existing in DB it might cause unexpected behavior.

Opportunities for refactor

- Break the function into smaller functions:
  - validateRequest(req)
  - loadUsers(db, actorId, userId)
  - authorize(actor, target, options)
  - validateEmail(email)
  - applyUpdates(db, targetId, updates)
  - sendSideEffects(mailer, opts)
- Use explicit error codes or a small Error type/union instead of raw strings.
- Make email validation more robust and isolated for testability.
- Treat side-effects (mailer) as optional and provide an option to not fail entire flow on email failure, or at least be explicit.
- Centralize logging so that business logic returns results and the outer orchestration logs consistently.
- Add unit tests for each pure function and integration tests for the orchestrator.

Suggested file/module layout

- src/
  - services/userService.ts (the refactored updateUserProfile orchestrator)
  - services/validation.ts (validate email, request shape)
  - services/auth.ts (authorization checks)
  - models/types.ts (User, Db, Mailer, Logger types)
  - __tests__/userService.test.ts (tests)

---

Original source (badcode.txt):

type User = {
  id: string;
  email: string;
  role?: "admin" | "user";
};

type Db = {
  getUserById(id: string): Promise<User | null>;
  updateUser(id: string, patch: Partial<User>): Promise<void>;
};

type Mailer = {
  send(to: string, subject: string, body: string): Promise<void>;
};

type Logger = {
  info(msg: string, extra?: any): void;
  warn(msg: string, extra?: any): void;
  error(msg: string, extra?: any): void;
};

type UpdateRequest = {
  userId: string;
  actorId: string;
  newEmail?: string;
  makeAdmin?: boolean;
  sendWelcome?: boolean;
};

export async function updateUserProfile(
  req: UpdateRequest,
  deps: { db: Db; mailer: Mailer; logger: Logger }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { db, mailer, logger } = deps;

  // Mixed responsibilities: validation, auth, business rules, persistence, side effects, logging.
  if (!req.userId || !req.actorId) {
    logger.warn("missing fields", { req });
    return { ok: false, error: "missing fields" };
  }

  const actor = await db.getUserById(req.actorId);
  if (!actor) {
    logger.warn("actor not found", { actorId: req.actorId });
    return { ok: false, error: "unauthorized" };
  }

  const target = await db.getUserById(req.userId);
  if (!target) {
    logger.warn("target not found", { userId: req.userId });
    return { ok: false, error: "not found" };
  }

  // Hard-to-read authorization rules and business rules intertwined.
  const actorIsAdmin = actor.role === "admin";
  const selfEdit = actor.id === target.id;

  if (!actorIsAdmin && !selfEdit) {
    logger.warn("forbidden update attempt", { actorId: actor.id, targetId: target.id });
    return { ok: false, error: "forbidden" };
  }

  // Email update logic, packed with edge cases in-line.
  if (req.newEmail) {
    const email = req.newEmail.trim().toLowerCase();
    if (!email.includes("@") || email.length < 6) {
      logger.warn("invalid email", { email, actorId: actor.id });
      return { ok: false, error: "invalid email" };
    }

    // weird rule: only admins can change email domain
    const oldDomain = target.email.split("@")[1] ?? "";
    const newDomain = email.split("@")[1] ?? "";
    if (oldDomain !== newDomain && !actorIsAdmin) {
      logger.warn("domain change blocked", { actorId: actor.id, oldDomain, newDomain });
      return { ok: false, error: "domain change requires admin" };
    }

    try {
      await db.updateUser(target.id, { email });
      logger.info("email updated", { targetId: target.id, by: actor.id });
    } catch (e: any) {
      logger.error("db update failed", { e, targetId: target.id });
      return { ok: false, error: "db error" };
    }
  }

  // Role changes: unclear invariants and duplicated logging.
  if (req.makeAdmin !== undefined) {
    if (!actorIsAdmin) {
      logger.warn("non-admin tried to change role", { actorId: actor.id });
      return { ok: false, error: "forbidden" };
    }
    try {
      await db.updateUser(target.id, { role: req.makeAdmin ? "admin" : "user" });
      logger.info("role changed", { targetId: target.id, makeAdmin: req.makeAdmin });
    } catch (e: any) {
      logger.error("db update failed", { e, targetId: target.id });
      return { ok: false, error: "db error" };
    }
  }

  // Side effects are mixed in and depend on partially-updated state.
  if (req.sendWelcome) {
    try {
      await mailer.send(
        (req.newEmail ?? target.email).trim().toLowerCase(),
        "Welcome!",
        `Hi! Your profile was updated.`
      );
      logger.info("welcome email sent", { targetId: target.id });
    } catch (e: any) {
      // silent partial failure semantics unclear
      logger.error("welcome email failed", { e, targetId: target.id });
      return { ok: false, error: "email failed" };
    }
  }

  return { ok: true };
}
