import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UploadAvatar extends PartialType(CreateUserDto) {
  @ApiProperty()
  pictureName: string;

  @ApiProperty()
  pictureDesc: string;

  nguoi_dung_id: number;

  ten_hinh: string;

  duong_dan: string;

  mo_ta: string;
}
