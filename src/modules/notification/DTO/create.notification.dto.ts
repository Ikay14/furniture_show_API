import { IsString } from "class-validator";


export class sendWelcomeEmailDTO{
    email: string
    firstName?: string
    otp: string
}

