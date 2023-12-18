import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';

export class CreateMailDto {
  @ApiProperty()
  @IsEmail()
  @MaxLength(35, { message: 'Maximum length is 35 characters' })
  email: string;
}
