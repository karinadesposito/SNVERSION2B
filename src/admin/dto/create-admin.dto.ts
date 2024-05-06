import {
  IsEmail,
  IsNotEmpty,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Column } from 'typeorm';

export class CreateAdminDto {
  @Length(6, 14)
  username: string;

  @IsEmail()
  email: string;

  @Length(8, 140)
  password: string;
}
