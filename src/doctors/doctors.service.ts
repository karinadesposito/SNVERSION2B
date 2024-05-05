import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { Doctor } from './entities/doctor.entity';
import { Repository } from 'typeorm/repository/Repository';
import { FindManyOptions } from 'typeorm';

type ResponseMessage = { message: string; data?: {}; statusCode: HttpStatus };

@Injectable()
export class DoctorsService {
  scheduleRepository: any;
  constructor(
    @InjectRepository(Doctor) private doctorRepository: Repository<Doctor>,
  ) {}

  async create(
    doctor: CreateDoctorDto,
  ): Promise<HttpException | CreateDoctorDto | ResponseMessage> {
    try {
      const doctorFound = await this.doctorRepository.findOne({
        where: { id: doctor.license },
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
      console.log(error);
      throw new HttpException(
        'No se pudo crear al doctor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getDoctors(): Promise<HttpException | Doctor[] | ResponseMessage> {
    try {
      const doctors = await this.doctorRepository.find();

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
  ): Promise<HttpException | Doctor[] | ResponseMessage> {
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
  ): Promise<HttpException | Doctor[] | ResponseMessage> {
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
  async findOneDoctor(
    id: string,
  ): Promise<HttpException | Doctor | ResponseMessage> {
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
  ): Promise<HttpException | UpdateDoctorDto | ResponseMessage> {
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

  async deleteDoctor(
    id: string,
  ): Promise<HttpException | Doctor | ResponseMessage> {
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
      await this.doctorRepository.delete({ id: id });
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
}
