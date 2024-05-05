import { IsNotEmpty } from 'class-validator';

export class CreateScheduleDto {
  @IsNotEmpty()
  day: string;

  @IsNotEmpty()
  idDoctor: string;

  @IsNotEmpty()
  start_Time: string;

  @IsNotEmpty()
  end_Time: string;

  @IsNotEmpty()
  available: boolean;
  
  @IsNotEmpty()
  interval: string;
}
