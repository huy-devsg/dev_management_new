import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants/jwtConstants';
import { PrismaClient } from '@prisma/client';
import { JwtStrategy } from './stagegy/jwtStragegy';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  prisma = new PrismaClient();
  jwtStrategy = new JwtStrategy();
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException();
      }

      try {
        const secret = jwtConstants.secret.login;
        const validatedUser = await this.jwtStrategy.validate(token, secret);
        request['user'] = validatedUser;
      } catch {
        throw new UnauthorizedException('Token invalid');
      }
      return true;
    }

    throw new UnauthorizedException('Missing token');
  }
}
