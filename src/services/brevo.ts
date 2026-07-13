import { env } from "../config/env";
import { AppError } from "../utils/AppError";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

interface SendEmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  toName?: string;
}

interface BrevoSendResponse {
  messageId?: string;
}

export function isBrevoConfigured(): boolean {
  return Boolean(env.brevoApiKey && env.brevoSenderEmail);
}

export async function sendTransactionalEmail(
  options: SendEmailOptions
): Promise<BrevoSendResponse> {
  const apiKey = env.brevoApiKey;
  const senderEmail = env.brevoSenderEmail;

  if (!apiKey) {
    throw new AppError(
      "BREVO_API_KEY is not configured. Add your Brevo API key to environment variables.",
      500
    );
  }

  if (!senderEmail) {
    throw new AppError(
      "BREVO_SENDER_EMAIL is not configured. Verify a sender in Brevo and set BREVO_SENDER_EMAIL.",
      500
    );
  }

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: {
        name: env.brevoSenderName,
        email: senderEmail,
      },
      to: [{ email: options.to, name: options.toName }],
      subject: options.subject,
      htmlContent: options.htmlContent,
      textContent: options.textContent,
    }),
  });

  const body = (await response.json().catch(() => ({}))) as {
    message?: string;
    code?: string;
    messageId?: string;
  };

  if (!response.ok) {
    const detail = body.message || response.statusText;
    throw new AppError(`Brevo email failed: ${detail}`, response.status >= 500 ? 502 : 400);
  }

  return { messageId: body.messageId };
}

export async function sendOtpEmail(to: string, code: number): Promise<void> {
  const appName = env.brevoSenderName;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #111; margin-bottom: 8px;">${appName} verification</h2>
      <p style="color: #444; font-size: 15px;">Use this code to complete sign in or sign up:</p>
      <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #6B21A8; margin: 24px 0;">${code}</p>
      <p style="color: #888; font-size: 13px;">This code expires in 10 minutes. If you did not request it, ignore this email.</p>
    </div>
  `.trim();

  const textContent = `Your ${appName} verification code is ${code}. It expires in 10 minutes.`;

  await sendTransactionalEmail({
    to,
    subject: `${code} is your ${appName} verification code`,
    htmlContent,
    textContent,
  });
}
