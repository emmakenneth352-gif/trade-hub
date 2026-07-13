export async function sendEmailOtp(to: string, code: number): Promise<void> {
  console.log(`\n📧 [DEV EMAIL] To: ${to}`);
  console.log(`   Your verification code is: ${code}\n`);
}

export async function sendPhoneOtp(to: string, code: number): Promise<void> {
  console.log(`\n📱 [DEV SMS] To: ${to}`);
  console.log(`   Your verification code is: ${code}\n`);
}
