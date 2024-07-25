import {
  IsEmail,
  Length,
} from 'class-validator';

export class CreateAdminDto {
  @Length(6, 14, { message: 'El nombre de usuario debe tener entre 6 y 14 caracteres' })
  username: string;

  @IsEmail()
  email: string;

  @Length(8, 140)
  password: string;
}
