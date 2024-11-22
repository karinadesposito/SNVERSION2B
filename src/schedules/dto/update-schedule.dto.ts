import { PartialType } from '@nestjs/mapped-types';
import { CreateScheduleDto } from './create-schedule.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoTurno } from '../enum/estados.enum';
import { DeletionReason } from '../enum/deleteSchedule.enum';

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {
  @IsEnum(EstadoTurno)
  @IsOptional()
  estado?: EstadoTurno; // Esto será opcional, ya que se está usando en una actualización

  @IsOptional()
  idPatient?: number;

  @IsOptional()
  deletionReason?: DeletionReason;
}

