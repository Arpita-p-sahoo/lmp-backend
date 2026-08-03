import { MailerModule, TemplateAdapter } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailService } from './mail.service';

const isMailEnabled = (process.env.ENABLE_MAIL ?? '').toLowerCase() !== 'false';

@Global()
@Module({
  imports: [
    ...(isMailEnabled
      ? [
          MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
              const { HandlebarsAdapter } =
                await import('@nestjs-modules/mailer/dist/adapters/handlebars.adapter');
              return {
                transport: {
                  host: configService.get<string>('MAIL_HOST'),
                  port: 465,
                  secure: true,
                  auth: {
                    user: configService.get<string>('MAIL_USER'),
                    pass: configService.get<string>('MAIL_PASS'),
                  },
                },
                template: {
                  dir: join(__dirname, 'templates'),
                  adapter:
                    new HandlebarsAdapter() as unknown as TemplateAdapter,
                  options: { strict: true },
                },
              };
            },
            inject: [ConfigService],
          }),
        ]
      : []),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
