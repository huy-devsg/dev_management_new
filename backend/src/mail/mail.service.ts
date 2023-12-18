import { Injectable } from '@nestjs/common';
import { CreateMailDto } from './dto/create-mail.dto';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { jwtConstants } from 'src/auth/constants/jwtConstants';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private prisma = new PrismaClient();

  private async generateToken(): Promise<string> {
    return uuidv4();
  }

  private async generateJwtToken(
    user_id: number,
    email: string,
    tokenId: string,
  ): Promise<string> {
    const token = this.jwtService.sign(
      { user_id, email, tokenId },
      {
        expiresIn: jwtConstants.expiresIn.resetPass,
        secret: jwtConstants.secret.resetPass,
      },
    );
    return token;
  }

  private async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }

  private async updateUserResetPassword(
    user_id: number,
    tokenBcrypt: string,
  ): Promise<void> {
    const checkIsUpdate = await this.prisma.user_reset_password.findFirst({
      where: {
        user_id,
      },
    });

    if (checkIsUpdate) {
      await this.prisma.user_reset_password.update({
        where: {
          user_id,
        },
        data: {
          is_update: false,
          token: tokenBcrypt,
        },
      });
    } else {
      await this.prisma.user_reset_password.create({
        data: {
          user_id,
          is_update: false,
          token: tokenBcrypt,
        },
      });
    }
  }

  private async sendResetPasswordEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const text = `Dear ${email},

    We received a request to reset your password for your account. Please click on the link below to set up a new password:
    
    [http://localhost:8080/reset-password/new?token=${token}]
    
    If you did not request this change, please disregard this email. Your account security is important to us, so we recommend you keep your password confidential and unique for each online service.
    
    Thank you,`;

    const emailOptions = {
      to: email,
      subject: 'Reset Password',
      text,
    };

    await this.mailerService.sendMail(emailOptions);
  }

  async sendEmail(body: CreateMailDto): Promise<any> {
    const { email } = body;
    try {
      const user = await this.prisma.users.findFirst({
        where: {
          email,
          is_delete: false,
        },
      });

      if (user) {
        const randomTokenId = await this.generateToken();
        const token = await this.generateJwtToken(
          user.user_id,
          email,
          randomTokenId,
        );
        const tokenBcrypt = await this.hashToken(randomTokenId);

        await this.updateUserResetPassword(user.user_id, tokenBcrypt);
        await this.sendResetPasswordEmail(email, token);

        return {
          status: 200,
          message: 'Send mail successfully!',
        };
      }
      return {
        status: 400,
        message: 'Send mail failed!',
      };
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
