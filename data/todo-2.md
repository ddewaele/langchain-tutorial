# Todo 2 — Create a refactor plan

Goal: Produce a refactor plan for the updateUserProfile function in badcode.txt. This plan will break the monolithic function into smaller units, improve naming, add tests, and set the path for implementation.

Plan outline

1. Define clear types and error codes
   - Create a Result type: either Success or Failure with typed error codes.
2. Split responsibilities into pure functions where possible:
   - validateRequest(req): ensures required fields exist
   - validateEmailFormat(email): returns normalized email or error
   - canChangeDomain(actor, oldEmail, newEmail): business rule
   - authorize(actor, target, action): returns boolean and reason
3. Create an orchestration function updateUserProfile that:
   - uses the pure helpers to validate and authorize
   - accumulates updates to apply in one db.updateUser call (if multiple fields changed)
   - performs db update(s) with clear error handling
   - triggers side effects (mailer) after successful persistence
4. Centralize logging in the orchestrator to avoid duplication.
5. Add unit tests:
   - Tests for each pure helper function
   - Tests for orchestrator covering success and failure paths: missing fields, actor not found, target not found, forbidden changes, invalid email, domain change blocked, DB errors (mocked), mailer errors (mocked)
6. Manual QA scenarios for integration testing.

Notes and decisions

- We'll change db.updateUser usage: instead of calling updateUser multiple times for email and role, accumulate a patch and call updateUser once to reduce DB roundtrips and avoid partial updates.
- On mailer failure, we'll keep behavior of failing the whole operation (to match original semantics). We'll add a config option to make this non-fatal in future if desired.
- Use simple email validation (presence of '@', length) kept from original but centralized; we document this.

Files to produce in the refactor

- code-3.txt: refactored implementation (TypeScript-like pseudocode)
- todo-3.md: explanation of implementation, rationale, and code snippets
- tests file(s) within the test plan in code-4.txt and todo-4.md

Next steps

- Implement the refactor (mark todo 3 as in_progress and start working).


