import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

export const paystackConfig = {
    baseUrl: process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co',
    secretKey: process.env.PAYSTACK_SECRET_KEY,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY
}