import { redirect } from "next/navigation";

import { LoginForm } from "@/app/components/login-form";
import { isAuthenticated } from "@/app/lib/auth";

export const metadata = {
  title: "Unlock · Expense Tracker",
};

export default async function LoginPage() {
  // Done here rather than in `proxy.ts` because it needs a real session check;
  // bouncing on cookie presence alone would loop for a stale cookie.
  if (await isAuthenticated()) {
    redirect("/");
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <main className="w-full max-w-xs">
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h1 className="text-lg font-semibold text-black">Expense Tracker</h1>
          <p className="mt-1 mb-5 text-sm text-zinc-500">
            Enter the 4-digit PIN to continue.
          </p>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
