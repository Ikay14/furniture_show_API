import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class MailService {
    private transporter = nodemailer.createTransport({
      host: "jamfortetech.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    private loadTemplate(templateName: string, data: Record<string, any>): string {
      const templatePath = path.join(process.cwd(), 'src', 'templates', `${templateName}.html`);
      let template = fs.readFileSync(templatePath, 'utf8');
      for (const [key, value] of Object.entries(data)) {
        template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
      return template;
    }

    async sendMailWithTemplate(to: string, subject: string, templateName: string, data: Record<string, any>): Promise<void> {
      const html = this.loadTemplate(templateName, data);
      await this.sendMail(to, subject, html);
    }

    async sendMail(to: string, subject: string, html?: string) {
      const mailOptions = {
        from: 'Ikechukwu@jamfortetech.com',
        to,
        subject,
        html,
      };

      try {
        const info = await this.transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
      } catch (error) {
        console.error(`Error sending email: ${error}`);
      }
    }
}