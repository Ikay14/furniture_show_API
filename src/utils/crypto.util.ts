import * as bcrypt from 'bcrypt';

export class CryptoUtil {
  private static readonly PASSWORD_SALT_ROUNDS = 12;
  private static readonly OTP_SALT_ROUNDS = 10;


  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.PASSWORD_SALT_ROUNDS);
  }

  // Hash OTP
  static async hashOTP(otp: string): Promise<string> {
    return bcrypt.hash(otp, this.OTP_SALT_ROUNDS);
  }


  // Compare hash
  static async compare(data: string, hash: string): Promise<boolean> {
    return bcrypt.compare(data, hash);
  }

  // Verify password
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return this.compare(password, hash);
  }

  // Verify OTP
  static async verifyOTP(otp: string, hash: string): Promise<boolean> {
    return this.compare(otp, hash);
  }

   static async expireOTP(): Promise<Date> {
      return new Date(Date.now() + 10 * 60 * 1000)
  }
}



