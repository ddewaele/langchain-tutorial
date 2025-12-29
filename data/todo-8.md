# Todo 8 — Manual QA test scenarios

Goal: Provide manual test scenarios QA can execute to validate the refactored code in an integrated environment.

Preparation

- Deploy the updated service code (from code-3.txt / code-5.txt) into a test environment.
- Ensure DB contains test users:
  - admin: { id: 'admin1', email: 'admin@example.com', role: 'admin' }
  - user1: { id: 'user1', email: 'user1@old.com', role: 'user' }
  - user2: { id: 'user2', email: 'user2@old.com', role: 'user' }
- Ensure mailer is configured to send or to a test mailbox; alternatively use a mailer stub that records sent messages.

Test cases

1) Missing fields
- Action: Call updateUserProfile with empty userId and/or actorId
- Expect: Response { ok: false, error: 'missing fields' }
- Log: Warning 'missing fields'

2) Actor not found
- Action: Call with actorId that doesn't exist
- Expect: { ok: false, error: 'unauthorized' }
- Log: Warning 'actor not found'

3) Target not found
- Action: Call with userId that doesn't exist
- Expect: { ok: false, error: 'not found' }
- Log: Warning 'target not found'

4) Self-update email (user updates own email)
- Action: user1 updates their email to 'me@old.com' (same domain)
- Expect: { ok: true }, DB updated email normalized to lowercase
- Log: Info 'user updated'

5) Non-admin tries to change another user's profile
- Action: user1 tries to update user2's email
- Expect: { ok: false, error: 'forbidden' }
- Log: Warning 'forbidden update attempt'

6) Admin changes another user's email domain
- Action: admin changes user1 email from 'user1@old.com' to 'user1@new.com'
- Expect: { ok: true }, DB updated with new domain
- Log: Info 'user updated'

7) Non-admin tries to change email domain
- Action: user1 tries to change their own email domain (if allowed), else another user
- Expect: { ok: false, error: 'domain change requires admin' } (when non-admin attempts domain change)
- Log: Warning 'domain change blocked'

8) Admin changes role of a user
- Action: admin sets user2.makeAdmin = true
- Expect: { ok: true }, DB role updated to 'admin'
- Log: Info 'user updated'

9) Non-admin tries to change role
- Action: user1 attempts to set user2.makeAdmin = true
- Expect: { ok: false, error: 'forbidden' }
- Log: Warning 'non-admin tried to change role'

10) Send welcome email after update
- Action: admin updates user1 email and sendWelcome = true
- Expect: { ok: true }, Mailer sends email to normalized address
- Log: Info 'welcome email sent'

11) Mailer failure
- Setup: Configure mailer to simulate failure for a particular target
- Action: sendWelcome = true
- Expect: { ok: false, error: 'email failed' }, DB changes (if any) may have already been applied
- Log: Error 'welcome email failed'

12) DB update failure
- Setup: Configure DB update to fail (simulate transactional error)
- Action: Attempt an email or role update
- Expect: { ok: false, error: 'db error' }
- Log: Error 'db update failed'

Post-test checks

- Verify DB state for each test to ensure updates are either applied or not according to expectations.
- Check logs for appropriate info/warn/error messages.
- Inspect test mailbox for sent emails and verify recipients, subjects, and minimal content.

Notes for QA

- Atomicity: Because the code batches updates into a single updateUser call, DB-side partial updates should be rare. However, if your DB implements updateUser as multiple operations or there are triggers, verify transactional behaviour.
- Environment parity: Run manual tests in an environment that mirrors production mailer and DB behavior to catch integration issues.

Files created

- manual test cases documented here (todo-8.md)

Next steps

- Final summary and conclusions (todo 9)
