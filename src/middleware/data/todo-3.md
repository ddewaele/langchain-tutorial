### Improving Email Validation Logic

#### Plan for Email Validation Improvement:

1. **Create Email Validation Function**:
   - Create a function `validateEmail(email: string): boolean` to handle email format validation.

2. **Refactor Existing Email Logic**:
   - Replace inline email validation within the `updateUserProfile` function with a call to `validateEmail`.

#### Email Validation Code Snippet
```typescript
function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function updateUserProfile(req: UpdateRequest, deps: { db: Db; mailer: Mailer; logger: Logger }): Promise<{ ok: true } | { ok: false; error: string }> {
    // Other logic remains the same...
 
    if (req.newEmail) {
        const email = req.newEmail.trim().toLowerCase();
        if (!validateEmail(email)) {
            logger.warn("invalid email", { email, actorId: actor.id });
            return { ok: false, error: "invalid email" };
        }

        // Additional email domain check and user update logic...
    }
}
```