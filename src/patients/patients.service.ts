import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { Repository } from 'typeorm';
import { IResponse } from '../interface/IResponse';

//injectRepository es quien nos permite poder vincular el crud con los datos que estamos almacenando en el entity

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient) private patientsRepository: Repository<Patient>,
  ) {}

  async create(
    patient: CreatePatientDto,
  ): Promise<HttpException | CreatePatientDto | IResponse> {
    try {
      const patientFound = await this.patientsRepository.findOne({
        where: { dni: patient.dni },
      });
      if (patientFound) {
        throw new HttpException(
        `Un paciente ya existe en la base de datos con éste DNI ${patientFound.dni},su id es ${patientFound.id}`,
          HttpStatus.CONFLICT,
        )
      } else {
        const newPatient = this.patientsRepository.create(patient);
        const patientSaved = await this.patientsRepository.save(newPatient);
        return {
          message: 'El paciente fue creado exitosamente',
          data: patientSaved,
          statusCode: HttpStatus.CREATED,
        };
      }
    }catch (error) {
      if (error.status === HttpStatus.CONFLICT) {
        throw error
      }
      throw new HttpException(
        "Error del servidor",
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getPatients(): Promise<UpdatePatientDto[] | IResponse | HttpException> {
    try {
      const patients = await this.patientsRepository.find({
        relations: ['coverage'],
      });
      if (!patients.length) {
        throw new HttpException(
          'No existen pacientes registrados',
          HttpStatus.CONFLICT,
        )
      } else {
        return {
          message: 'La lista de pacientes está compuesta por:',
          data: patients,
          statusCode: HttpStatus.OK,
        };
      }
    }  catch (error) {
      if (error.status === HttpStatus.CONFLICT) {
        throw error
      }
      throw new HttpException(
        "Error del servidor",
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async findOnePatient(
    id:number,
  ): Promise<HttpException | UpdatePatientDto | IResponse> {
    try {
      const patient = await this.patientsRepository.findOne({
        where: { id: id },
      });
      if (!patient) {
        throw new HttpException(
          `El paciente con id ${id} no fue encontrado`,
        HttpStatus.CONFLICT,
        )
      } else {
        return {
          message: `El paciente encontrado con id ${id} es:`,
          data: patient,
          statusCode: HttpStatus.OK,
        };
      }
    } catch (error) {
      if (error.status === HttpStatus.CONFLICT) {
        throw error
      }
      throw new HttpException(
        "Error del servidor",
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async updatePatient(id: number, updatePatient: Partial<UpdatePatientDto>): Promise<HttpException | UpdatePatientDto | IResponse> {
    try {
      const patient = await this.patientsRepository.findOne({
        where: { id: id },
      });
      if (!patient) {
        throw new HttpException(
          `El paciente con ID ${id} no se ha encontrado`,
          HttpStatus.NOT_FOUND,
        );
      }
//verifica que updatePatient tenga una prop dni
      if (updatePatient.dni) {
        const existingPatient = await this.patientsRepository.findOne({
          where: { dni: updatePatient.dni },
        });
        if (existingPatient && existingPatient.id !== id) {
          throw new HttpException(
            `El DNI ${updatePatient.dni} ya está registrado para otro paciente`,
            HttpStatus.CONFLICT,
          );
        }
      }

      await this.patientsRepository.update(id, updatePatient);

      return {
        message: 'Las modificaciones son las siguientes: ',
        data: { ...updatePatient, datosAnteriores: patient },
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND || HttpStatus.CONFLICT) {
        throw error;
      }
      throw new HttpException(
        'Error del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async deletePatient(
    id: number,
  ): Promise<HttpException | Patient | IResponse> {
    try {
      const patient = await this.patientsRepository.findOne({
        where: { id: id },
      });
      if (!patient) {
        throw new HttpException(
          `El paciente con id ${id} no ha sido encontrado: `,
          HttpStatus.NOT_FOUND,
        )
      } else {
        await this.patientsRepository.delete({ id: id });
        return {
          message: `Se ha eliminado el paciente con el id ${id}`,
          statusCode: HttpStatus.OK,
        };
      }
    }catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error
      }
      throw new HttpException(
        "Error del servidor",
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }}
}
