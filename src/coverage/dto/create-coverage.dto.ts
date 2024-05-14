import { IsNotEmpty, MaxLength } from 'class-validator';
export class CreateCoverageDto {
  @IsNotEmpty()
  @MaxLength(25)
  coverages: string;
}
