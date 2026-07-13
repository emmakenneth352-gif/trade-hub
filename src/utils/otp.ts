import { isBrevoConfigured, sendOtpEmail } from "../services/brevo";
import { AppError } from "./AppError";

export async function sendEmailOtp(to: string, code: number): Promise<void> {
  if (isBrevoConfigured()) {
    await sendOtpEmail(to, code);
    return;
  }

  // Dev fallback when Brevo is not configured
  if (process.env.NODE_ENV === "production") {
    throw new AppError(
      "Email OTP is not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL on the server.",
      500
    );
  }

  console.log(`\n📧 [DEV EMAIL] To: ${to}`);
  console.log(`   Your verification code is: ${code}\n`);
}

export async function sendPhoneOtp(to: string, code: number): Promise<void> {
  console.log(`\n📱 [DEV SMS] To: ${to}`);
  console.log(`   Your verification code is: ${code}\n`);
}
