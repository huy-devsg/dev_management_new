import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @MaxLength(35, { message: 'Maximum length is 35 characters' })
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8, { message: 'Minimum length is 8 characters' })
  @MaxLength(15, { message: 'Maximum length is 15 characters' })
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(50, { message: 'Maximum length is 15 characters' })
  full_name: string;

  @ApiProperty()
  @IsNotEmpty()
  avatar: string;

  @ApiProperty()
  @IsNotEmpty()
  role: string;

  @ApiProperty()
  @IsNotEmpty()
  gender: boolean;

  @ApiProperty()
  @IsNotEmpty()
  language: number[];

  @ApiProperty()
  @IsNotEmpty()
  desc: string;
}
