import { Controller, Post, Query, Get, UseGuards } from '@nestjs/common';
import { MailService } from './mail.service';
import { CreateMailDto } from './dto/create-mail.dto';
import { Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Reset Password')
@Controller('api/ResetPassword')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  async sendEmail(@Body() body: CreateMailDto): Promise<any> {
    return await this.mailService.sendEmail(body);
  }
}
