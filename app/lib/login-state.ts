// Separate from `app/auth-actions.ts` because a "use server" file may only
// export async functions.
export type LoginState = {
  error: string;
};

export const LOGIN_INITIAL_STATE: LoginState = { error: "" };
