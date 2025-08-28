import type { ReactNode } from "react";
import { Resend } from "resend";

interface EmailPayload {
  to: string[];
  subject: string;
  from: string;
  react: ReactNode;
}

const resend = new Resend(Bun.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, from, react }: EmailPayload) {
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    react,
  });

  if (error) {
    return error;
  }

  return data;
}
