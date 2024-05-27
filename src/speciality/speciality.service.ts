import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSpecialityDto } from './dto/create-speciality.dto';
import { UpdateSpecialityDto } from './dto/update-speciality.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Speciality } from './entities/speciality.entity';
import { Repository } from 'typeorm';
import { IResponse } from '../interface/IResponse';

@Injectable()
export class SpecialityService {
  constructor(
    @InjectRepository(Speciality)
    private specialityRepository: Repository<Speciality>,
  ) {}
  async create(
    name: CreateSpecialityDto,
  ): Promise<HttpException | CreateSpecialityDto | IResponse> {
    try {
      const nameFound = await this.specialityRepository.findOne({
        where: { name: name.name },
      });

      if (nameFound) {
        return {
          message: `La especialidad con nombre ${nameFound.name} ya existe en la base de datos`,
          statusCode: HttpStatus.CONFLICT,
        };
      }
      const newSpeciality = this.specialityRepository.create(name);
      const savedSpeciality =
        await this.specialityRepository.save(newSpeciality);
      if (savedSpeciality) {
        return {
          message: `La especialidad ha sido creado exitosamente`,
          data: savedSpeciality,
          statusCode: HttpStatus.CREATED,
        };
      }
    } catch (error) {
      throw new HttpException(
        'No se pudo crear la especialidad',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSpeciality(): Promise<HttpException | Speciality[] | IResponse> {
    try {
      const specialitys = await this.specialityRepository.find();

      if (!specialitys.length)
        return {
          message: 'No existen especialidades registradas',
          statusCode: HttpStatus.NO_CONTENT,
        };
      else {
        return {
          message: 'La lista de especialidades está compuesta por:',
          data: specialitys,
          statusCode: HttpStatus.FOUND,
        };
      }
    } catch (error) {
      throw new HttpException(
        'Ha ocurrido un error.No se pudo traer la lista de especialidades',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneSpeciality(
    id: string,
  ): Promise<HttpException | Speciality | IResponse> {
    try {
      const speciality = await this.specialityRepository.findOne({
        where: { id: id },
      });
      if (!speciality) {
        return {
          message: 'La especialidad no fue encontrada',
          statusCode: HttpStatus.CONFLICT,
        };
      }
      return {
        message: 'La especialidad encontrada es:',
        data: speciality,
        statusCode: HttpStatus.FOUND,
      };
    } catch (error) {
      throw new HttpException(
        'Ha ocurrido una falla en la busqueda',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async updateSpeciality(
    id: string,
    updateSpeciality: Partial<UpdateSpecialityDto>,
  ): Promise<HttpException | UpdateSpecialityDto | IResponse> {
    try {
      const speciality = await this.specialityRepository.findOne({
        where: { id: id },
      });
      if (!speciality) {
        return new HttpException(
          'La especialidad no existe en la base de datos',
          HttpStatus.NOT_FOUND,
        );
      }
      await this.specialityRepository.update(id, updateSpeciality);
      return {
        message: 'Las modificaciones son las siguientes: ',
        data: { ...updateSpeciality, datosAnteriores: speciality },
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(
        'No se pudo actualizar la especialidad',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteSpeciality(
    id: string,
  ): Promise<HttpException | Speciality | IResponse> {
    try {
      const speciality = await this.specialityRepository.findOne({
        where: { id: id },
      });
      if (!speciality) {
        return new HttpException(
          'La especialidad no existe en la base de datos',
          HttpStatus.NOT_FOUND,
        );
      }
      await this.specialityRepository.delete({ id: id });
      return {
        message: 'Se ha eliminado la especialidad: ',
        data: speciality.name,
        statusCode: HttpStatus.MOVED_PERMANENTLY,
      };
    } catch (error) {
      throw new HttpException(
        'No se pudo eliminar la especialidad',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
