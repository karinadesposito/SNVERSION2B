import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoTurno } from '../entities/schedule.entity';
import { DeletionReason } from '../enum/deleteSchedule.enum';

export class UpdateBatchScheduleDto {
  @IsArray()
  ids: number[]; // Lista de IDs de los turnos a actualizar

  @IsEnum(EstadoTurno)
  estado: EstadoTurno;

  @IsOptional()
  @IsString()
  deletionReason?: DeletionReason; // Solo requerido si el estado es "ELIMINADO"
}
