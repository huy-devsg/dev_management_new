import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        service: 'gmail',
        auth: {
          user: 'huy676363@gmail.com',
          pass: 'fiox npqd vidn xrmd',
        },
      },
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
