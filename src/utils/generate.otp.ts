import * as crypto from 'crypto'

export function GenerateOTP():any {
    return crypto.randomInt(100000, 999999).toString
}