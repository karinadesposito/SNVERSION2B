import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateSpecialityDto {
  @IsNotEmpty()
  @MaxLength(25)
  name: string;
}
