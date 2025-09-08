import * as crypto from 'crypto'

export function GenerateOTP(): string {
    return crypto.randomInt(100000, 999999).toString()
}