import { Request } from 'express';
import crypto from 'crypto'
import { paystackConfig } from 'src/config/paystack.config';


export function authenticatePaystackSignature (req: Request) {
      const secret = paystackConfig.secretKey!

    const signature = req.headers['x-paystack-signature'] as string

    if (!signature) return false; 

    // Compute HMAC hash
    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    // If the signature doesn’t match, reject
    if (signature !== hash) return signature === hash
}