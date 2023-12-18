import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDTO } from './dto/login.dto';
import { signupDTO } from './dto/signup.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('/api/Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/Login')
  login(@Body() loginDTO: loginDTO) {
    return this.authService.login(loginDTO);
  }
  @Post('/Register')
  signup(@Body() signupDTO: signupDTO) {
    return this.authService.signup(signupDTO);
  }

  @Get('CheckLogin')
  checkLogin(@Request() req) {
    return this.authService.checkToken(req, 'login');
  }
  @Get('CheckTokenEmail')
  CheckTokenEmail(@Request() req) {
    return this.authService.checkToken(req, 'reset');
  }
}
