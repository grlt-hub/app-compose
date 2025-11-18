import type { Result } from '@shared';

type GuardResult = Result<void, { message: string }>;

export type { GuardResult };
