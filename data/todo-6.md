# Todo 6 — Functional documentation (user-facing)

Goal: Provide functional documentation describing what updateUserProfile does from a user's perspective.

Overview

The updateUserProfile function updates a user's profile information in the system. It accepts an update request and performs the requested changes if the request is valid and authorized.

Key capabilities

- Update a user's email address
  - The provided email is normalized (trimmed and lower-cased) and lightly validated.
  - If the email domain changes (e.g., from example.com to new.com), only administrators can perform that change.
- Change a user's role to or from admin
  - Only administrators can change user roles.
- Send a welcome email
  - Optionally send a welcome email to the user's (possibly updated) email address.

Who can perform updates

- A user can edit their own profile (self-edit) for permitted fields.
- Administrators can edit any user's profile and perform domain changes and role changes.

Inputs

- userId: ID of the user to update (required)
- actorId: ID of the user performing the update (required)
- newEmail: optional new email address to set for the target user
- makeAdmin: optional boolean; when present, sets the target user's role to admin (true) or user (false)
- sendWelcome: optional boolean; if true, a welcome email is sent after updates

Outputs

- On success: { ok: true }
- On failure: { ok: false, error: '<error-code>' }

Common error codes (and when they occur)

- missing fields: userId or actorId was not provided
- unauthorized: actorId is not found in the database
- not found: userId (target) is not found in the database
- forbidden: actor is not allowed to perform the requested change
- invalid email: the provided newEmail is malformed
- domain change requires admin: attempted to change email domain without admin privileges
- db error: persistence (database) update failed
- email failed: sending the welcome email failed

Behavior notes

- Email normalization: emails are trimmed and converted to lower-case before validation and sending.
- Validation is intentionally lightweight (checks presence of '@' and minimum length) — if you need stricter validation (e.g., regex or domain MX checks), we can extend validateEmailFormat.
- Updates are applied in a single database update call when both email and role are changed to reduce partial updates.
- If a mailer error occurs when sending welcome emails, the function currently treats that as a failure of the whole operation (like the original behavior). This can be configured in the future.

Example usage

- Update your own email and send welcome:
  - req: { userId: 'me', actorId: 'me', newEmail: 'me@new.com', sendWelcome: true }
  - result: { ok: true } (if validation passes)

- Admin changing another user's role:
  - req: { userId: 'u1', actorId: 'admin1', makeAdmin: true }
  - result: { ok: true }

File references

- Implementation: code-3.txt (refactored source)
- Tests: code-4.txt (unit tests)

Next steps

- Technical documentation (todo 7)
- Manual QA scenarios (todo 8)

