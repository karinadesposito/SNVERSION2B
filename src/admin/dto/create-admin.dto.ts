import {
  IsEmail,
  Length,
} from 'class-validator';

export class CreateAdminDto {
  @Length(6, 14)
  username: string;

  @IsEmail()
  email: string;

  @Length(8, 140)
  password: string;
}
