import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { Coverage } from '../../coverage/entities/coverage.entity';

export class CreatePatientDto {
  @MinLength(4)
  @MaxLength(25)
  fullName: string;
  @IsEmail()
  @IsNotEmpty()
  mail: string;
  @IsNotEmpty()
  phone: string;
  coverage: Coverage
  @IsNotEmpty()
  dni: string;
  @IsNotEmpty()
  birthday: Date;
  @IsNotEmpty()
  address: string;
}
