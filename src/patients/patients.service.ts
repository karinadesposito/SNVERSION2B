import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { Repository } from 'typeorm';
type ResponseMessage = { message: string; data?: {}; statusCode: HttpStatus }; // se declara ésta sentencia para dar respuesta a determinadas situaciones

//injectRepository es quien nos permite poder vincular el crud con los datos que estamos almacenando en el entity

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient) private patientsRepository: Repository<Patient>,
  ) {}

  async create(
    patient: CreatePatientDto,
  ): Promise<HttpException | CreatePatientDto | ResponseMessage> {
    try {
      const patientFound = await this.patientsRepository.findOne({
        where: { id: patient.dni },
      });
      if (patientFound) {
        return {
          message: 'El paciente ya existe en la base de datos',
          data: { id: patientFound.id, username: patientFound.dni },
          statusCode: HttpStatus.CONFLICT,
        };
      } else {
        const newPatient = this.patientsRepository.create(patient);
        const patientSaved = await this.patientsRepository.save(newPatient);
        return {
          message: 'El paciente fue creado exitosamente',
          data: patientSaved,
          statusCode: HttpStatus.CREATED,
        };
      }
    } catch (error) {
      throw new HttpException(
        'No se pudo crear al paciente',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPatients(): Promise<
    UpdatePatientDto[] | ResponseMessage | HttpException
  > {
    try {
      const patients = await this.patientsRepository.find();
      if (!patients.length) {
        return {
          message: 'No existen pacientes registrados',
          statusCode: HttpStatus.NO_CONTENT,
        };
      } else {
        return {
          message: 'La lista de pacientes está compuesta por:',
          data: patients,
          statusCode: HttpStatus.NO_CONTENT,
        };
      }
    } catch (error) {
      throw new HttpException(
        'Ha ocurrido un error.No se pudo traer la lista de pacientes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOnePatient(
    id: string,
  ): Promise<HttpException | UpdatePatientDto | ResponseMessage> {
    try {
      const patient = await this.patientsRepository.findOne({
        where: { id: id },
      });
      if (!patient) {
        return {
          message: 'El paciente no fue encontrado',
          statusCode: HttpStatus.CONFLICT,
        };
      } else {
        return {
          message: 'El paciente encontrado es:',
          data: patient,
          statusCode: HttpStatus.OK,
        };
      }
    } catch (error) {
      throw new HttpException(
        'Ha ocurrido una falla en la busqueda',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePatient(id: string, updatePatient: Partial<UpdatePatientDto>) {
    try {
      const patient = await this.patientsRepository.findOne({
        where: { id: id },
      });
      if (!patient) {
        return {
          message: 'El paciente no se ha encontrado:',
          statusCode: HttpStatus.NOT_FOUND,
        };
      } else {
        await this.patientsRepository.update(id, updatePatient);

        return {
          message: 'Las modificaciones son las siguientes: ',
          data: { ...updatePatient, datosAnteriores: patient },
          statusCode: HttpStatus.OK,
        };
      }
    } catch (error) {
      throw new HttpException(
        'No se pudo actualizar el paciente',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async deletePatient(
    id: string,
  ): Promise<HttpException | Patient | ResponseMessage> {
    try {
      const patient = await this.patientsRepository.findOne({
        where: { id: id },
      });
      if (!patient) {
        return {
          message: 'El paciente no ha sido encontrado: ',
          statusCode: HttpStatus.NOT_FOUND,
        };
      } else {
        await this.patientsRepository.delete({ id: id });
        return {
          message: 'Se ha eliminado el paciente: ',
          data: patient,
          statusCode: HttpStatus.OK,
        };
      }
    } catch (error) {
      throw new HttpException(
        'No se pudo eliminar el paciente',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
