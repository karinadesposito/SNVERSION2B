import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
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

  async create(
    doctor: CreateDoctorDto,
  ): Promise<HttpException | CreateDoctorDto | IResponse> {
    try {
      const doctorFound = await this.doctorRepository.findOne({
        where: { license: doctor.license },
      });

      if (doctorFound) {
        return {
          message: `El doctor con matricula ${doctorFound.license} ya existe en la base de datos`,
          statusCode: HttpStatus.CONFLICT,
        };
      }

      const newDoctor = this.doctorRepository.create(doctor);
      const savedDoctor = await this.doctorRepository.save(newDoctor);
      if (savedDoctor) {
        return {
          message: `El doctor ha sido creado exitosamente`,
          data: savedDoctor,
          statusCode: HttpStatus.CREATED,
        };
      }
    } catch (error) {
      throw new HttpException(
        'No se pudo crear al doctor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addCoverageToDoctor({
    doctorId,
    coverageId,
  }: AddCoverageToDoctorDto): Promise<Doctor> {
    const doctor = await this.doctorRepository
      .findOne({
        where: { id: doctorId },
        relations: ['coverages'],
      })
      .catch(() => {
        throw new NotFoundException(
          `Doctor con ID ${doctorId} no fue encontrado`,
        );
      });

    if (!doctor.coverages) {
      doctor.coverages = [];
    }

    for (const id of coverageId) {
      const coverage = await this.coverageRepository
        .findOne({ where: { id } })
        .catch(() => {
          throw new NotFoundException(
            `Coverage con ID ${id} no fue encontrado`,
          );
        });
      doctor.coverages.push(coverage);
    }

    return this.doctorRepository.save(doctor);
  }
  async removeCoverageFromDoctor({
    doctorId,
    coverageId,
  }: AddCoverageToDoctorDto): Promise<Doctor> {
    const doctor = await this.doctorRepository
      .findOne({
        where: { id: doctorId },
        relations: ['coverages'],
      })
      .catch(() => {
        throw new NotFoundException(
          `Doctor con ID ${doctorId} no fue encontrado`,
        );
      });

    if (!doctor.coverages || doctor.coverages.length === 0) {
      throw new NotFoundException(
        `El doctor con ID ${doctorId} no tiene coberturas`,
      );
    }

    doctor.coverages = doctor.coverages.filter(
      (coverage) => !coverageId.includes(coverage.id),
    );

    return this.doctorRepository.save(doctor);
  }

  async getDoctors(): Promise<HttpException | Doctor[] | IResponse> {
    try {
      const doctors = await this.doctorRepository.find({
        relations: ['speciality', 'coverages'],
      });

      if (!doctors.length)
        return {
          message: 'No existen doctores registrados',
          statusCode: HttpStatus.NO_CONTENT,
        };
      else {
        return {
          message: 'La lista de doctores está compuesta por:',
          data: doctors,
          statusCode: HttpStatus.FOUND,
        };
      }
    } catch (error) {
      throw new HttpException(
        'Ha ocurrido un error.No se pudo traer la lista de doctores',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  //Busca todos los turnos que se encuentren disponible del doctor especificado.
  async getDoctorsShift(
    idDoctor: string,
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
        return {
          message: 'No existe el doctor especificado',
          statusCode: HttpStatus.NOT_FOUND,
        };
      }
      const availableSchedules = doctors[0]?.schedule.filter(
        (schedule) => schedule.available,
      );
      if (!availableSchedules.length) {
        return {
          message: 'No hay turnos disponibles para el doctor especificado',
          statusCode: HttpStatus.NO_CONTENT,
        };
      }
      return {
        message: 'Turnos disponibles del doctor:',
        data: availableSchedules,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(
        'Ha ocurrido un error. No se pudo obtener la lista de doctores',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  //Busca todos los turnos que se encuentren ya tomados del doctor especificado.
  async getDoctorsUnAvailable(
    idDoctor: string,
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
        return {
          message: 'No existe el doctor especificado',
          statusCode: HttpStatus.NOT_FOUND,
        };
      }
      const availableSchedules = doctors[0]?.schedule.filter(
        (schedule) => !schedule.available,
      );
      if (!availableSchedules.length) {
        return {
          message: 'No hay turnos disponibles para el doctor especificado',
          statusCode: HttpStatus.NO_CONTENT,
        };
      }
      return {
        message: 'Turnos ya asignados del doctor:',
        data: availableSchedules,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(
        'Ha ocurrido un error. No se pudo obtener la lista de doctores',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async findOneDoctor(id: string): Promise<HttpException | Doctor | IResponse> {
    try {
      const doctor = await this.doctorRepository.findOne({
        where: { id: id },
      });
      if (!doctor) {
        return {
          message: 'El doctor no fue encontrado',
          statusCode: HttpStatus.CONFLICT,
        };
      }
      return {
        message: 'El doctor encontrado es:',
        data: doctor,
        statusCode: HttpStatus.FOUND,
      };
    } catch (error) {
      throw new HttpException(
        'Ha ocurrido una falla en la busqueda',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async updateDoctor(
    id: string,
    updateDoctor: Partial<UpdateDoctorDto>,
  ): Promise<HttpException | UpdateDoctorDto | IResponse> {
    try {
      const doctor = await this.doctorRepository.findOne({
        where: { id: id },
      });
      if (!doctor) {
        return new HttpException(
          'El Doctor no existe en la base de datos',
          HttpStatus.NOT_FOUND,
        );
      }
      await this.doctorRepository.update(id, updateDoctor);
      return {
        message: 'Las modificaciones son las siguientes: ',
        data: { ...updateDoctor, datosAnteriores: doctor },
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(
        'No se pudo actualizar el doctor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteDoctor(id: string): Promise<HttpException | Doctor | IResponse> {
    try {
      const doctor = await this.doctorRepository.findOne({
        where: { id: id },
      });
      if (!doctor) {
        return new HttpException(
          'El Doctor no existe en la base de datos',
          HttpStatus.NOT_FOUND,
        );
      }
      await this.doctorRepository.softDelete({ id: id });
      return {
        message: 'Se ha eliminado el doctor con la matricula: ',
        data: doctor.license,
        statusCode: HttpStatus.MOVED_PERMANENTLY,
      };
    } catch (error) {
      throw new HttpException(
        'No se pudo eliminar el doctor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findPatientsByDoctorId(
    doctorId: string,
  ): Promise<HttpException | Patient[] | IResponse> {
    try {
      const options: FindOneOptions<Doctor> = {
        relations: ['schedule', 'schedule.shift', 'schedule.shift.idPatient'],
        where: { id: doctorId },
      };

      const doctor = await this.doctorRepository.findOne(options);

      if (!doctor) {
        return new HttpException(
          'El Doctor no existe en la base de datos',
          HttpStatus.NOT_FOUND,
        );
      }

      if (doctor.schedule.length === 0) {
        return {
          message: 'No se encontraron pacientes asociados al médico',
          statusCode: HttpStatus.NOT_FOUND,
        };
      }

      const patients = doctor.schedule
        .filter((schedule) => schedule.shift)
        .map((schedule) => schedule.shift.idPatient);

      return {
        message: 'Los pacientes del médico son:',
        data: patients,
        statusCode: HttpStatus.FOUND,
      };
    } catch (error) {
      throw new HttpException(
        'Ha ocurrido un error. No se pudo obtener la lista de pacientes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findBySpeciality(
    specialityName: string,
  ): Promise<HttpException | Doctor[] | IResponse> {
    try {
      const specialityDoctor = await this.doctorRepository.find({
        where: { speciality: { name: specialityName } },
      });
      if (!specialityDoctor.length) {
        return {
          message: 'La especialidad no fue encontrada',
          statusCode: HttpStatus.NOT_FOUND,
        };
      } else {
        return {
          message: 'Los doctores con dicha especialidad son:',
          data: specialityDoctor,
          statusCode: HttpStatus.FOUND,
        };
      }
    } catch (error) {
      throw new HttpException(
        'Ha ocurrido una falla en la busqueda',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
