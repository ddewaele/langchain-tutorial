# Todo 4 — Add unit tests covering main behavior and edge cases

Goal: Create unit tests for the refactored updateUserProfile function. Tests cover validation, authorization, business rules, persistence errors, and mailer behavior.

What I implemented

- Created Jest-style tests that mock Db, Mailer, and Logger to simulate different scenarios.
- Each test asserts the returned result and verifies that db and mailer are called (or not) as expected.
- Tests include both success and failure cases:
  - missing fields
  - actor not found
  - target not found
  - forbidden edits by non-admin
  - invalid email
  - domain change blocked for non-admin
  - successful email update by admin (including domain changes)
  - role change forbidden for non-admin
  - role change allowed for admin
  - db.updateUser throwing an error
  - sending welcome email success and failure

Notes about execution

- I cannot run the tests in this environment, so I include the test code and the expected outcomes for each test case. When run in a Node environment with Jest, the mocks should produce the described results.

Expected test outcomes (summary)

- missing fields -> { ok: false, error: 'missing fields' }
- actor not found -> { ok: false, error: 'unauthorized' }
- target not found -> { ok: false, error: 'not found' }
- forbidden update (non-admin editing another) -> { ok: false, error: 'forbidden' }
- invalid email -> { ok: false, error: 'invalid email' }
- domain change blocked -> { ok: false, error: 'domain change requires admin' }
- successful email update by admin -> { ok: true } and db.updateUser called with email patch
- role change forbidden (non-admin) -> { ok: false, error: 'forbidden' }
- role change by admin -> { ok: true } and db.updateUser called with role patch
- db update error -> { ok: false, error: 'db error' }
- welcome email sent -> { ok: true } and mailer.send called
- welcome email failed -> { ok: false, error: 'email failed' }

Test file written to code-4.txt.
