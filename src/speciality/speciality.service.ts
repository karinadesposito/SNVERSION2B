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
       throw new HttpException(
         `La especialidad con nombre ${nameFound.name} ya existe en la base de datos`,
           HttpStatus.CONFLICT,
        )
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
      if (error.status === HttpStatus.CONFLICT ) {
        throw error;
      }
      throw new HttpException(
        'Error del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSpeciality(): Promise<HttpException | Speciality[] | IResponse> {
    try {
      const specialitys = await this.specialityRepository.find();

      if (!specialitys.length)
      throw new HttpException(
          'No existen especialidades registradas',
         HttpStatus.NOT_FOUND,
        )
      else {
        return {
          message: 'La lista de especialidades está compuesta por:',
          data: specialitys,
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

  async findOneSpeciality(
    id:number,
  ): Promise<HttpException | Speciality | IResponse> {
    try {
      const speciality = await this.specialityRepository.findOne({
        where: { id: id },
      });
      if (!speciality) {
        throw new HttpException(
         'La especialidad no fue encontrada',
        HttpStatus.NOT_FOUND,
        )
      }
      return {
        message: 'La especialidad encontrada es:',
        data: speciality,
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
  async updateSpeciality(
    id: number,
    updateSpeciality: Partial<UpdateSpecialityDto>,
  ): Promise<HttpException | UpdateSpecialityDto | IResponse> {
    try {
      const speciality = await this.specialityRepository.findOne({
        where: { id: id },
      });
      if (!speciality) {
        throw new HttpException(
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
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        'Error del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteSpeciality(
    id: number,
  ): Promise<HttpException | IResponse | Speciality> {
    try {
      const speciality = await this.specialityRepository.findOne({ where: { id } });

      if (!speciality) {
        throw new HttpException(
          'La especialidad no existe en la base de datos',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.specialityRepository.remove(speciality);

      return {
        message: `Se ha eliminado la especialidad: ${speciality.name}`,
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