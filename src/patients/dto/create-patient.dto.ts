import { IsEmail, IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';
import { Coverage } from '../../coverage/entities/coverage.entity';

export class CreatePatientDto {
  @MinLength(4)
  @MaxLength(25)
  fullName: string;
  @IsEmail()
  @IsNotEmpty()
  mail: string;
  @IsNotEmpty()
  @Matches(/^[1-9]\d{9}$/, { message: 'el teléfono debe tener un total de 10 números (sin ceros iniciales ni guiones)' })
  phone: string;
  coverage: Coverage
  @IsNotEmpty()
  @Matches(/^\d{7,8}$/, { message: 'el DNI debe tener 7 u 8 dígitos y no contener puntos ni guiones' })
  dni: string;
  @IsNotEmpty()
  birthday: Date;
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(25)
  address: string;
}
