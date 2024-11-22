export enum EstadoTurno {
    DISPONIBLE = 'disponible', 
    CONFIRMADO = 'confirmado',//por el paciente, mail confirmatorio, recordatorio?//
    CANCELADO = 'cancelado',//cancelado x paciente 
    ELIMINADO = 'eliminado', //en el caso de que lo elimine el médico
    EJECUTADO = 'ejecutado',
    NO_ASISTIDO = 'no_asistido',//no fue el paciente
    NO_RESERVADO = 'no_reservado'//quedaron disponibles
  }