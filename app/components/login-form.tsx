"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/auth-actions";
import { LOGIN_INITIAL_STATE } from "@/app/lib/login-state";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    LOGIN_INITIAL_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="pin" className="text-sm font-medium text-zinc-700">
          PIN
        </label>
        <input
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          pattern="\d{4}"
          maxLength={4}
          required
          autoFocus
          placeholder="••••"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-center text-2xl tracking-[0.5em] text-black"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {pending ? "Checking…" : "Unlock"}
      </button>
    </form>
  );
}
