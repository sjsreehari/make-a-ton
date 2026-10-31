import { describe, test } from 'vitest';

describe('Idempotent Billing Runs (Person B)', () => {
  test.todo(
    'running billing generation twice for the same period yields identical counts with skipped: true and ALREADY_BILLED',
  );
});
