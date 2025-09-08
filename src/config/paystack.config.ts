import dotenv from 'dotenv';
dotenv.config();

export const paystackConfig = {
    baseUrl: process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co',
    secretKey: process.env.PAYSTACK_SECRET_KEY,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY
}