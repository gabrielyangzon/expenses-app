"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { EXPENSE_CATEGORIES, PAYERS, expenses } from "@/db/schema";

type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
type Payer = (typeof PAYERS)[number];

function isExpenseCategory(value: unknown): value is ExpenseCategory {
  return (
    typeof value === "string" &&
    (EXPENSE_CATEGORIES as readonly string[]).includes(value)
  );
}

function isPayer(value: unknown): value is Payer {
  return (
    typeof value === "string" && (PAYERS as readonly string[]).includes(value)
  );
}

function parseExpenseInput(formData: FormData) {
  const description = String(formData.get("description") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "");
  const category = formData.get("category");
  const paidBy = formData.get("paidBy");
  const date = String(formData.get("date") ?? "");

  if (!description) {
    throw new Error("Description is required.");
  }

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number.");
  }

  if (!isExpenseCategory(category)) {
    throw new Error("Invalid category.");
  }

  if (!isPayer(paidBy)) {
    throw new Error("Invalid payer.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    throw new Error("Invalid date.");
  }

  return {
    description,
    amount: amount.toFixed(2),
    category,
    paidBy,
    date,
  };
}

function parseExpenseId(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid expense id.");
  }
  return id;
}

export async function createExpenseAction(formData: FormData) {
  const values = parseExpenseInput(formData);
  await db.insert(expenses).values(values);
  revalidatePath("/");
}

export async function updateExpenseAction(formData: FormData) {
  const id = parseExpenseId(formData);
  const values = parseExpenseInput(formData);
  await db.update(expenses).set(values).where(eq(expenses.id, id));
  revalidatePath("/");
  redirect("/");
}

export async function deleteExpenseAction(formData: FormData) {
  const id = parseExpenseId(formData);
  await db.delete(expenses).where(eq(expenses.id, id));
  revalidatePath("/");
  redirect("/");
}
