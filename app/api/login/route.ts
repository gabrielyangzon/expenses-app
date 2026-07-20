import { cookies } from "next/headers";

import { isValidPinFormat, verifyPin } from "@/app/lib/pin";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/app/lib/session-cookie";
import { createSession } from "@/app/lib/session";
import { getStoredPinHash } from "@/db/queries";

const GENERIC_ERROR = "Incorrect PIN.";

export async function POST(request: Request) {
  let pin = "";
  try {
    const body = await request.json();
    pin = typeof body?.pin === "string" ? body.pin : "";
  } catch {
    return Response.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  // One generic message for both a malformed and a wrong PIN, so a failed
  // attempt reveals nothing beyond "not it".
  if (!isValidPinFormat(pin)) {
    return Response.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const storedHash = await getStoredPinHash();
  if (!storedHash) {
    return Response.json(
      { error: "No PIN has been set. Run `npm run set-pin` first." },
      { status: 500 },
    );
  }

  if (!verifyPin(pin, storedHash)) {
    return Response.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const token = await createSession();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return Response.json({ ok: true });
}
