### Creating Unit Tests for the `updateUserProfile` Function

#### Unit Tests Plan

1. **Test Cases**:
   - Test for missing userId or actorId in the request.
   - Test for unauthorized actor (not admin and not the same as the target).
   - Test for invalid email format.
   - Test for successful email update.
   - Test for successful admin role change.
   - Test for sending a welcome email.

2. **Testing Framework**: Use a framework like Jest or Mocha.

#### Unit Test Code Snippet (Using Jest)
```typescript
import { updateUserProfile } from './path_to_code';
import { Db, Mailer, Logger } from './dependencies';

describe('updateUserProfile', () => {
    let db: Db;
    let mailer: Mailer;
    let logger: Logger;

    beforeEach(() => {
        // Mock dependencies
        db = {
            getUserById: jest.fn(),
            updateUser: jest.fn(),
        };
        mailer = {
            send: jest.fn(),
        };
        logger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        };
    });

    test('should return error if userId is missing', async () => {
        const response = await updateUserProfile({ actorId: 'actor-1' }, { db, mailer, logger });
        expect(response).toEqual({ ok: false, error: 'missing fields' });
    });

    test('should return error if email is invalid', async () => {
        const response = await updateUserProfile({ userId: 'user-1', actorId: 'actor-1', newEmail: 'invalid-email' }, { db, mailer, logger });
        expect(response).toEqual({ ok: false, error: 'invalid email' });
    });

    // Additional tests for successful and failure paths...
});
```