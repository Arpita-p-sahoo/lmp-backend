import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private configService: ConfigService,
    @Optional() private mailerService?: MailerService,
  ) {}

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    if (!this.mailerService) return;
    const firstName = name?.split(' ')[0] ?? 'there';
    const frontendUrl = this.configService.get<string>('frontendUrl') ?? '';
    await this.mailerService.sendMail({
      to: email,
      subject: `Welcome to LastMinPrep, ${firstName}! 🎉`,
      template: './welcome', // points to templates/welcome.hbs
      context: {
        firstName,
        profileEditUrl: `${frontendUrl}/profile/edit`,
      },
    });
  }
}
