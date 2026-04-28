import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const SENDER_EMAIL =
  process.env.SENDER_EMAIL || "onboarding@resend.dev";
export const SENDER_NAME = process.env.NEXT_PUBLIC_APP_NAME || "AVL";
export const SENDER = `${SENDER_NAME} <${SENDER_EMAIL}>`;
