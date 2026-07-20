// Lives outside `app/actions.ts` because a "use server" file may only export
// async functions — exporting the initial-state object from there is a build error.
export type CreateExpenseState = {
  status: "idle" | "success" | "error";
  message: string;
  // Bumped on every successful insert so the form can reset itself.
  submissions: number;
};

export const CREATE_EXPENSE_INITIAL_STATE: CreateExpenseState = {
  status: "idle",
  message: "",
  submissions: 0,
};
