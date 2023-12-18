import { Injectable, UnauthorizedException } from '@nestjs/common';
import { loginDTO } from './dto/login.dto';
import { signupDTO } from './dto/signup.dto';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { jwtConstants } from './constants/jwtConstants';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  prisma = new PrismaClient();
  async login(body: loginDTO) {
    const { email, password } = body;
    try {
      const user = await this.prisma.users.findFirst({
        where: {
          email,
          is_delete: false,
        },
      });
      if (!user) {
        return { status: 401, message: 'Email không tồn tại' };
      } else {
        const passComparre = await bcrypt.compare(password, user.password);

        if (!passComparre) {
          return { status: 401, message: 'Sai password' };
        } else {
          const token = this.jwtService.sign(
            { user_id: user.user_id, email },
            {
              expiresIn: jwtConstants.expiresIn.login,
              secret: jwtConstants.secret.login,
            },
          );
          return {
            status: 201,
            message: 'Login thành công',
            accessToken: token,
          };
        }
      }
    } catch (err) {
      throw new UnauthorizedException();
    }
  }

  async signup(body: signupDTO) {
    const { email, password } = body;
    try {
      const passBcrypt: string = await bcrypt.hash(password, 10);

      const checkEmail = await this.prisma.users.findFirst({
        where: {
          email,
        },
      });

      if (!checkEmail) {
        const data = await this.prisma.users.create({
          data: { ...body, password: passBcrypt },
        });
        const createAvtClone = await this.prisma.user_avatar.create({
          data: {
            user_id: data.user_id,
            avatar_link: 'no_avatar.jpg',
          },
        });
        return {
          status: 201,
          message: 'Đăng ký thành công.',
        };
      }
      return {
        status: 400,
        message: 'Email đã tồn tại.',
      };
    } catch (err) {
      throw new Error(`Error creating user: ${err}`);
    }
  }
  async checkToken(req, secret) {
    try {
      if (secret === 'login') {
        secret = jwtConstants.secret.login;
      } else {
        secret = jwtConstants.secret.resetPass;
      }
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return { status: 400, token: false };
      }
      const decodedToken = await this.jwtService.verifyAsync(token, { secret });
      if (decodedToken) {
        if (secret === 'SECRET_RESET') {
          const { user_id, tokenId } = decodedToken;

          const tokenDB = await this.prisma.user_reset_password.findFirst({
            where: {
              user_id,
            },
          });
          if (tokenDB) {
            const tokenCompare = await bcrypt.compare(tokenId, tokenDB.token);
            if (!tokenCompare) {
              return { status: 400, token: false };
            }
          }
        } else {
          const { email } = decodedToken;
          const user = await this.prisma.users.findFirst({
            where: {
              email,
              is_delete: false,
            },
          });
          if (!user) {
            return { status: 400, message: 'Email không tồn tại' };
          }
        }
        return { status: 200, token: true };
      }
    } catch (error) {
      return { status: 400, token: false };
    }
  }
}
