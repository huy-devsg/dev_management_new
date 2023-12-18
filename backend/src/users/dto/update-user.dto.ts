import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
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
