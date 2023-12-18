import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtStrategy } from 'src/auth/stagegy/jwtStragegy';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from 'src/auth/authGuard';
import { jwtConstants } from 'src/auth/constants/jwtConstants';
import { v4 as uuidv4 } from 'uuid';
import { UploadAvatar } from './dto/update-avatar.dto';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UsersService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}
  jwtStrategy = new JwtStrategy();
  prisma = new PrismaClient();
  private selectInfoUser = {
    email: true,
    full_name: true,
    avatar: true,
    gender: true,
    role: true,
    desc: true,
  };
  private async handleUser(
    id: number | undefined,
    body: CreateUserDto | UpdateUserDto,
  ) {
    try {
      const { email, full_name, gender, role, desc, language } = body;

      const data = id
        ? await this.prisma.users.update({
            where: {
              user_id: id,
            },
            data: {
              email,
              full_name,
              gender,
              role,
              desc,
              is_delete: false,
            },
          })
        : await this.prisma.users.create({
            data: {
              email,
              full_name,
              gender,
              role,
              desc,
              is_delete: false,
            },
          });

      if (id) {
        await this.prisma.user_language.deleteMany({
          where: {
            user_id: id,
          },
        });
      }

      const languageCreationPromises = language.map(async (lang) => {
        try {
          const createLang = await this.prisma.user_language.create({
            data: {
              language_id: Number(lang),
              user_id: data.user_id,
            },
          });
          return createLang;
        } catch (error) {
          throw new Error(`Error creating language: ${error}`);
        }
      });

      const createdLanguages = await Promise.all(languageCreationPromises);

      return data;
    } catch {
      throw new Error();
    }
  }
  async getAllUser() {
    try {
      const data = await this.prisma.users.findMany({
        where: {
          is_delete: false,
        },
        select: {
          user_id: true,
          email: true,
          full_name: true,
          gender: true,
          role: true,
          desc: true,
          user_language: {
            select: {
              language: {
                select: {
                  language_id: true,
                  language_name: true,
                },
              },
            },
          },
        },
      });
      return data;
    } catch {
      throw new Error();
    }
  }
  async getUserById(userId: number) {
    try {
      const data = await this.prisma.users.findFirst({
        where: {
          user_id: userId,
          is_delete: false,
        },
        select: {
          user_id: true,
          email: true,
          full_name: true,
          gender: true,
          role: true,
          desc: true,
          user_language: {
            select: {
              language: {
                select: {
                  language_id: true,
                  language_name: true,
                },
              },
            },
          },
        },
      });
      return data;
    } catch {
      throw new Error();
    }
  }
  async addUser(body: CreateUserDto) {
    try {
      const { email } = body;

      const checkEmail = await this.prisma.users.findMany({
        where: {
          email,
        },
      });

      if (!checkEmail.length) {
        const data = await this.handleUser(undefined, body);
        return data;
      } else {
        throw new Error('Email đã tồn tại');
      }
    } catch {
      throw new Error();
    }
  }
  async updateUser(id: number, body: UpdateUserDto) {
    try {
      const data = await this.handleUser(id, body);
      return data;
    } catch {
      throw new Error();
    }
  }
  async updatePassword(user) {
    const { token, password } = user;
    const secret = jwtConstants.secret.resetPass;
    const validatedUser = await this.jwtStrategy.validate(token, secret);
    const { user_id } = validatedUser;
    const passBcrypt: string = await bcrypt.hash(password, 10);
    try {
      if (!validatedUser) {
        return {
          status: 400,
          message: 'Token has been used!',
        };
      }
      const checkIsUpdate = await this.prisma.user_reset_password.findFirst({
        where: {
          user_id,
        },
      });
      const currentDate = new Date();
      const randomTokenId = uuidv4();
      const tokenBcrypt: string = await bcrypt.hash(randomTokenId, 10);

      if (checkIsUpdate) {
        await this.prisma.user_reset_password.update({
          where: {
            user_id,
          },
          data: {
            is_update: true,
            updateAt: currentDate,
            token: tokenBcrypt,
          },
        });
      }
      const res = await this.prisma.users.update({
        where: {
          user_id,
        },
        data: {
          password: passBcrypt,
        },
      });

      return {
        status: 200,
        message: 'Updated password successly!',
      };
    } catch {}
  }
  async removeUser(id: number) {
    try {
      const data = await this.prisma.users.update({
        where: {
          user_id: id,
        },
        data: {
          is_delete: true,
        },
      });
      return data;
    } catch {
      return {
        status: 400,
        message: 'Update password Error!',
      };
    }
  }
  async uploadAvatar(userId, file, pictureUrl) {
    console.log('pictureUrl: ', pictureUrl);
    console.log('file: ', file);
    console.log('userId upload: ', userId);
    try {
      const isAvatar = await this.prisma.user_avatar.findMany({
        where: {
          user_id: userId,
        },
      });
      let data = null;
      if (!isAvatar) {
        pictureUrl = 'images/' + pictureUrl;
        data = await this.prisma.user_avatar.create({
          data: {
            user_id: userId,
            avatar_link: pictureUrl,
          },
        });
      } else {
        data = await this.prisma.user_avatar.update({
          where: {
            user_id: userId,
          },
          data: {
            user_id: userId,
            avatar_link: pictureUrl,
          },
        });
      }
      return { data };
    } catch {
      throw new Error('Failed to upload picture.');
    }
  }

  async uploadAvataByUserId(userId, file, pictureUrl) {
    console.log('pictureUrl: ', pictureUrl);
    console.log('file: ', file);
    console.log('userId upload: ', userId);
    try {
      const isAvatar = await this.prisma.user_avatar.findMany({
        where: {
          user_id: userId,
        },
      });
      let data = null;
      if (!isAvatar) {
        pictureUrl = 'images/' + pictureUrl;
        data = await this.prisma.user_avatar.create({
          data: {
            user_id: userId,
            avatar_link: pictureUrl,
          },
        });
      } else {
        data = await this.prisma.user_avatar.update({
          where: {
            user_id: userId,
          },
          data: {
            user_id: userId,
            avatar_link: pictureUrl,
          },
        });
      }
      return { data };
    } catch {
      throw new Error('Failed to upload picture.');
    }
  }

  async linkAvatar(user_id) {
    try {
      const data = await this.prisma.user_avatar.findFirst({
        select: {
          avatar_link: true,
        },
        where: {
          user_id,
        },
      });
      return { data };
    } catch {}
  }
  getBase64Avatar(body: any) {
    const { name } = body;
    return readFileSync(join(process.cwd(), '/public/images/' + name));
  }
}
