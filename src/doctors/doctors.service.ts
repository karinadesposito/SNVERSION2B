import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { Doctor } from './entities/doctor.entity';
import { Repository } from 'typeorm/repository/Repository';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { IResponse } from '../interface/IResponse';
import { Coverage } from '../coverage/entities/coverage.entity';
import { AddCoverageToDoctorDto } from '../coverage/dto/add-coverage.dto';
import { Patient } from '../patients/entities/patient.entity';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor) private doctorRepository: Repository<Doctor>,
    @InjectRepository(Coverage)
    private coverageRepository: Repository<Coverage>,
  ) {}
  async create(doctor: CreateDoctorDto): Promise<IResponse> {
    try {
      const doctorFound = await this.doctorRepository.findOne({
        where: { license: doctor.license },
      });

      if (doctorFound) {
        throw new HttpException(
          `El doctor con matricula ${doctorFound.license} ya existe en la base de datos`,
          HttpStatus.CONFLICT,
        );
      }

      const newDoctor = this.doctorRepository.create(doctor);
      const savedDoctor = await this.doctorRepository.save(newDoctor);

      return {
        message: 'El doctor ha sido creado exitosamente',
        data: savedDoctor,
        statusCode: HttpStatus.CREATED,
      };
    } catch (error) {
      if (error.status === HttpStatus.CONFLICT) {
        throw error;
      }
      throw new HttpException(
        'Error del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addCoverageToDoctor({
    doctorId,
    coverageId,
  }: AddCoverageToDoctorDto): Promise<Doctor> {
    try {
      const doctor = await this.doctorRepository.findOne({
        where: { id: doctorId },
        relations: ['coverages'],
      });
      if (!doctor) {
        throw new HttpException(
          `Doctor con ID ${doctorId} no fue encontrado`,
          HttpStatus.NOT_FOUND,
        );
      }

      if (!doctor.coverages) {
        doctor.coverages = [];
      }

      for (const id of coverageId) {
        const coverage = await this.coverageRepository.findOne({
          where: { id },
        });

        if (!coverage) {
          throw new HttpException(
            `Coverage con ID ${id} no fue encontrado`,
            HttpStatus.NOT_FOUND,
          );
        }
        const existing = doctor.coverages.some((cov) => cov.id === id);

        if (existing) {
          throw new HttpException(
            `El doctor ya tiene asociada la cobertura con ID ${id}`,
            HttpStatus.CONFLICT,
          );
        }

        doctor.coverages.push(coverage);
      }

      return this.doctorRepository.save(doctor);
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
  async removeCoverageFromDoctor({
    doctorId,
    coverageId,
  }: AddCoverageToDoctorDto): Promise<Doctor | IResponse> {
    try {
      const doctor = await this.doctorRepository.findOne({
        where: { id: doctorId },
        relations: ['coverages'],
      });
      if (!doctor) {
        throw new HttpException(
          `Doctor con ID ${doctorId} no fue encontrado`,
          HttpStatus.NOT_FOUND,
        );
      }

      if (!doctor.coverages || doctor.coverages.length === 0) {
        throw new HttpException(
          `El doctor con ID ${doctorId} no tiene coberturas`,
          HttpStatus.NOT_FOUND,
        );
      }
      for (const id of coverageId) {
        const coverageExists = await this.coverageRepository.findOne({
          where: { id },
        });
        if (!coverageExists) {
          throw new HttpException(
            `Coverage con ID ${id} no fue encontrado`,
            HttpStatus.NOT_FOUND,
          );
        }
      }
      doctor.coverages = doctor.coverages.filter(
        (coverage) => !coverageId.includes(coverage.id),
      );
      this.doctorRepository.save(doctor);
      return {
        message: `Se ha desasociado la cobertura ${coverageId} del doctor ${doctorId}`,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        'Error del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getDoctors(): Promise<HttpException | Doctor[] | IResponse> {
    try {
      const doctors = await this.doctorRepository.find({
        relations: ['speciality', 'coverages'],
      });

      if (!doctors.length)
        throw new HttpException(
          'No existen doctores registrados',
          HttpStatus.NOT_FOUND,
        );
      else {
        return {
          message: 'La lista de doctores está compuesta por:',
          data: doctors,
          statusCode: HttpStatus.OK,
        };
      }
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        'Error del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  //Busca todos los turnos que se encuentren disponible del doctor especificado.
  async getDoctorsShiff(
    idDoctor: number,
  ): Promise<HttpException | Doctor[] | IResponse> {
    try {
      const options: FindManyOptions<Doctor> = {
        relations: ['schedule'],
        where: {
          id: idDoctor,
        },
      };
      const doctors = await this.doctorRepository.find(options);

      if (!doctors.length) {
        throw new HttpException(
          `No existe el doctor especificado con id ${idDoctor}`,
          HttpStatus.NOT_FOUND,
        );
      }
      const availableSchedules = doctors[0]?.schedule.filter(
        (schedule) => schedule.available,
      );
      if (!availableSchedules.length) {
        throw new HttpException(
          `No hay turnos disponibles para el doctor especificado con id ${idDoctor}`,
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        message: 'Turnos disponibles del doctor:',
        data: availableSchedules,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error
      }
      throw new HttpException(
        "Error del servidor",
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async findOneDoctor(id: number): Promise<HttpException | Doctor | IResponse> {
    try {
      const doctor = await this.doctorRepository.findOne({
        where: { id: id },
      });
      if (!doctor) {
        throw new HttpException(
         `El doctor con ${id} no fue encontrado`,
          HttpStatus.CONFLICT,
        );
      }
      return {
        message: 'El doctor encontrado es:',
        data: doctor,
        statusCode: HttpStatus.OK,
      };
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
  async updateDoctor(
    id: number,
    updateDoctor: Partial<UpdateDoctorDto>,
  ): Promise<HttpException | UpdateDoctorDto | IResponse> {
    try {
      const doctor = await this.doctorRepository.findOne({
        where: { id: id },
      });
      if (!doctor) {
        throw new HttpException(
          `El Doctor con ${id} no existe en la base de datos`,
          HttpStatus.NOT_FOUND,
        );
      }
      await this.doctorRepository.update(id, updateDoctor);
      return {
        message: 'Las modificaciones son las siguientes: ',
        data: { ...updateDoctor, datosAnteriores: doctor },
        statusCode: HttpStatus.OK,
      };
    }  catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error
      }
      throw new HttpException(
        "Error del servidor",
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async deleteDoctor(id: number): Promise<HttpException | Doctor | IResponse> {
    try {
      const doctor = await this.doctorRepository.findOne({
        where: { id: id },
      });
      if (!doctor) {
        throw new HttpException(
          `El Doctor con id ${id} no existe en la base de datos`,
          HttpStatus.NOT_FOUND,
        );
      }
      await this.doctorRepository.softDelete({ id: id });
      return {
        message: `Se ha eliminado el doctor con la matrícula ${doctor.license}`,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (error.status === HttpStatus.MOVED_PERMANENTLY || HttpStatus.NOT_FOUND) {
        throw error
      }
      throw new HttpException(
        "Error del servidor",
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async findPatientsByDoctorId(
    doctorId: number,
  ): Promise<HttpException | Patient[] | IResponse> {
    try {
      const options: FindOneOptions<Doctor> = {
        relations: ['schedule', 'schedule.shiff', 'schedule.shiff.idPatient'],
        where: { id: doctorId },
      };

      const doctor = await this.doctorRepository.findOne(options);

      if (!doctor) {
        throw new HttpException(
          `El Doctor con ${doctorId} no existe en la base de datos`,
          HttpStatus.NOT_FOUND, 
        );
      }

      if (doctor.schedule.length === 0) {
        throw new HttpException(
          `No se encontraron pacientes asociados al médico con id ${doctorId}`,
           HttpStatus.NOT_FOUND,
          )
      }

      const patients = doctor.schedule
        .filter((schedule) => schedule.shiff)
        .map((schedule) => schedule.shiff.idPatient);

      return {
        message: 'Los pacientes del médico son:',
        data: patients,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        'Error del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  
  }

}
