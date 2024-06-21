import { IsNotEmpty } from 'class-validator';

export class CreateScheduleDto {
  @IsNotEmpty()
  day: string;

  @IsNotEmpty()
  idDoctor: number;

  @IsNotEmpty()
  start_Time: string;

  @IsNotEmpty()
  end_Time: string;

  @IsNotEmpty()
  available: boolean;
  
  @IsNotEmpty()
  interval: string;
}
