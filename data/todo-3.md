# Todo 3 — Implement refactor

Goal: Implement the refactored code for updateUserProfile following the plan.

What I changed

- Extracted small helper functions: validateRequest, normalizeEmail, validateEmailFormat, getDomain
- Accumulate updates into a single patch object and call db.updateUser once
- Centralized logging messages and kept original error semantics
- Kept behavior: only admins can change domains, non-admins can't change role, mailer failures fail the operation
- Returned typed Ok/Err results for clarity

Refactored code written to code-2.txt

Rationale

- Single db.updateUser reduces partial updates and makes behavior atomic from the code perspective (though real atomicity depends on DB implementation).
- Helpers are pure or near-pure and easy to unit test.
- Centralized validation and email normalization reduces duplication and unexpected casing issues.

Next steps

- Add unit tests for helper functions and the orchestrator using mocks for db and mailer (todo 4)
- Run tests and iterate (todo 5)
