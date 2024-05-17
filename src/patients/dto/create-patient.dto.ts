import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { Coverage } from 'src/coverage/entities/coverage.entity';

export class CreatePatientDto {
  @MinLength(4)
  @MaxLength(25)
  firstLastName: string;
  @IsEmail()
  @IsNotEmpty()
  mail: string;
  @IsNotEmpty()
  phone: string;
  @IsNotEmpty()
  coverage: Coverage
  @IsNotEmpty()
  dni: string;
  @IsNotEmpty()
  birthday: Date;
  @IsNotEmpty()
  address: string;
}
