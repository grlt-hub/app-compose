type GuardResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

export type { GuardResult };
