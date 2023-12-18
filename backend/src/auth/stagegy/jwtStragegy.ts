// jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'jwtsecretkey',
    });
  }
  jwtService = new JwtService();
  config = new ConfigService();
  prisma = new PrismaClient();
  async validate(token: string, secret) {
    const decoded = this.jwtService.verify(token, {
      secret,
    });
    const { user_id, exp } = decoded;
    const currentTime = Math.floor(Date.now() / 1000);
    if (exp && exp < currentTime) {
      throw new UnauthorizedException('Token expired');
    }

    try {
      const user = await this.prisma.users.findFirst({
        select: {
          user_id: true,
          email: true,
          role: true,
        },
        where: {
          user_id,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
