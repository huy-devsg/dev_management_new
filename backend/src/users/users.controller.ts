import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/authGuard';
import { Express } from 'express';
import { diskStorage } from 'multer';
import { getPictureName, setPictureName } from '../utils/picture-name';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadAvatar } from './dto/update-avatar.dto';
import { readFileSync } from 'fs';
import { join } from 'path';
@ApiTags('User')
@Controller('api/Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/addUser')
  addUser(@Body() body: CreateUserDto) {
    return this.usersService.addUser(body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/getListUser')
  getAllUser(@Request() request) {
    const { role } = request.user;
    if (role !== 'admin') {
      throw new UnauthorizedException();
    }
    return this.usersService.getAllUser();
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/getUserById')
  getUserById(@Request() request) {
    const userId = request.user.user_id;
    return this.usersService.getUserById(+userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('/updateUser/:userId')
  updateUser(@Param('userId') userId: number, @Body() body: UpdateUserDto) {
    return this.usersService.updateUser(+userId, body);
  }

  @Patch('/ResetPassword')
  updatePassword(@Body() body: any) {
    return this.usersService.updatePassword(body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('/deleteUser/:id')
  removeUser(@Param('id') id: string, @Request() request) {
    const { role } = request.user;
    if (role !== 'admin') {
      throw new UnauthorizedException();
    }
    return this.usersService.removeUser(+id);
  }
  @Post('UploadAvatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: process.cwd() + '/public/images',
        filename: (req, file, callback) => {
          setPictureName(file.originalname);
          const pictureName = getPictureName();
          callback(null, pictureName);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File, @Request() request) {
    console.log('file: ', file);
    const userId = request.user.user_id;
    const pictureName = getPictureName();
    return this.usersService.uploadAvatar(+userId, file, pictureName);
  }

  @Post('UploadAvatar/:userId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: process.cwd() + '/public/images',
        filename: (req, file, callback) => {
          setPictureName(file.originalname);
          const pictureName = getPictureName();
          callback(null, pictureName);
        },
      }),
    }),
  )
  uploadAvataByUserId(
    @UploadedFile() file: Express.Multer.File,
    @Param('userId') userId: number,
  ) {
    const pictureName = getPictureName();
    return this.usersService.uploadAvataByUserId(+userId, file, pictureName);
  }

  @Get('/getLinkAvatar')
  @UseGuards(JwtAuthGuard)
  linkAvatar(@Request() request) {
    const userId = request.user.user_id;
    return this.usersService.linkAvatar(userId);
  }
  @Get('/getLinkAvatar/:userId')
  linkAvatarByUserId(@Param('userId') userId: number) {
    return this.usersService.linkAvatar(+userId);
  }
  @Post('/getFile')
  imageBuffer(@Body() body: any) {
    return this.usersService.getBase64Avatar(body);
  }
}
