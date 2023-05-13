import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { ConfigService } from '@nestjs/config';
import { SendEmailInput } from './dto/send-email.input';
import { EmailConfig } from '../config/base.config';
import { getRecoverEmailHTML } from './templates/recoverPasswordEmail';
import { getSetPasswordEmail } from './templates/setPasswordEmail';
import { getPasswordSetEmail } from './templates/passwordSetEmail';
import { changeEmailHTML } from './templates/changeEmail';

export const EMAIL_SERVICE = 'EMAIL_SERVICE';

export interface IEmailService {
  sendEmail(email: SendEmailInput): Promise<void>;
  getRecoverPasswordEmail(requestId: string, email: string, fullName: string, domain: string): string;
  getSetPasswordEmail(requestId: string, email: string, fullName: string, domain: string): string;
  getPasswordSetEmail(): string;
  getChangeEmail(domain: string, email: string, fullName: string): string;
}

@Injectable()
export class StubEmailService implements IEmailService {
  async sendEmail(email: SendEmailInput): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`sendEmail\n${email}`);
  }

  getRecoverPasswordEmail(requestId: string, email: string, fullName: string, domain: string): string {
    return `${requestId}${email}${fullName}${domain}`;
  }

  getSetPasswordEmail(requestId: string, email: string, fullName: string, domain: string): string {
    return `${requestId}${email}${fullName}${domain}`;
  }

  getPasswordSetEmail(): string {
    return 'You set password';
  }

  getChangeEmail(fullName: string): string {
    return `${fullName} change email`;
  }
}

@Injectable()
export class EmailService implements IEmailService {
  private readonly defaultSender: string;

  private readonly client: Transporter<SMTPTransport.SentMessageInfo>;

  constructor(
    private readonly configService: ConfigService,
  ) {
    const config = configService.get<EmailConfig>('emailConfig');

    this.defaultSender = config.defaultSenderName ?
      `"${config.defaultSenderName}" ${config.defaultSenderEmail}` :
      config.defaultSenderEmail;

    this.client = createTransport({
      host: config.host,
      port: 465,
      secure: true,
      auth: {
        user: config.username,
        pass: config.password,
      },
    });
  }

  async sendEmail(email: SendEmailInput): Promise<void> {
    const sender = (email.senderName ? `"${email.senderName}" ${email.sender}` : email.sender);

    await this.client.sendMail({
      subject: email.subject,
      from: sender ?? this.defaultSender,
      to: email.recipients,
      text: email.text,
      html: email.html,
      cc: email.carbonCopies,
      bcc: email.blindCarbonCopies,
    });
  }

  getRecoverPasswordEmail(requestId: string, userId: string, fullName: string, domain: string): string {
    return getRecoverEmailHTML(requestId, userId, fullName, domain);
  }

  getSetPasswordEmail(requestId: string, userId: string, fullName: string, domain: string): string {
    return getSetPasswordEmail(requestId, userId, fullName, domain);
  }

  getPasswordSetEmail(): string {
    return getPasswordSetEmail();
  }

  getChangeEmail(domain: string, email: string, fullName: string): string {
    return changeEmailHTML(domain, email, fullName);
  }
}
