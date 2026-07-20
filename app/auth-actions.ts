"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { LoginState } from "@/app/lib/login-state";
import { isValidPinFormat, verifyPin } from "@/app/lib/pin";
import { SESSION_COOKIE, createSessionValue } from "@/app/lib/session";
import { getStoredPinHash } from "@/db/queries";

const GENERIC_ERROR = "Incorrect PIN.";

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const pin = String(formData.get("pin") ?? "");

  // Same message whether the format is wrong or the PIN simply doesn't match,
  // so a failed attempt reveals nothing beyond "not it".
  if (!isValidPinFormat(pin)) {
    return { error: GENERIC_ERROR };
  }

  const storedHash = await getStoredPinHash();
  if (!storedHash) {
    return { error: "No PIN has been set. Run `npm run set-pin` first." };
  }

  if (!verifyPin(pin, storedHash)) {
    return { error: GENERIC_ERROR };
  }

  const { value, maxAge } = createSessionValue();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });

  redirect("/");
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
