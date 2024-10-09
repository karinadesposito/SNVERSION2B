

import { IsNotEmpty, IsEnum, IsOptional, IsBoolean, IsNumber, IsString } from 'class-validator';
import { EstadoTurno } from '../entities/schedule.entity'; // Asegúrate de importar el enum correctamente

export class CreateScheduleDto {
  @IsNotEmpty()
  @IsString()
  day: string; // La fecha del turno

  @IsNotEmpty()
  @IsNumber()
  idDoctor: number; // ID del doctor que da el turno

  @IsNotEmpty()
  @IsString()
  start_Time: string; // Hora de inicio del turno

  @IsNotEmpty()
  @IsString()
  end_Time: string; // Hora de fin del turno

  @IsOptional() // Este campo es opcional
  @IsBoolean()
  removed?: boolean; // Indica si el turno fue eliminado

  @IsOptional()
  @IsString()
  interval?: string; // Intervalo de tiempo (opcional)


  @IsOptional()
  @IsEnum(EstadoTurno) // Usamos el enum de EstadoTurno 
  estado?: EstadoTurno; // Estado del turno (disponible, confirmado, etc.)
}

