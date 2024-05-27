import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCoverageDto } from './dto/create-coverage.dto';
import { Coverage } from './entities/coverage.entity';
import { UpdateCoverageDto } from './dto/update-coverage.dto';
import { IResponse } from '../interface/IResponse';

@Injectable()
export class CoveragesService {
  constructor(
    @InjectRepository(Coverage)
    private coverageRepository: Repository<Coverage>,
  ) {}
  async create(
    coverage: CreateCoverageDto,
  ): Promise<HttpException | CreateCoverageDto | IResponse> {
    try {
      const nameFound = await this.coverageRepository.findOne({
        where: { coverages: coverage.coverages },
      });

      if (nameFound) {
        return {
          message: `La obra social con nombre ${nameFound.coverages} ya existe en la base de datos`,
          statusCode: HttpStatus.CONFLICT,
        };
      }
      const newCoverage = this.coverageRepository.create(coverage);
      const savedCoverage = await this.coverageRepository.save(newCoverage);
      if (savedCoverage) {
        return {
          message: `La obra social ha sido creado exitosamente`,
          data: savedCoverage,
          statusCode: HttpStatus.CREATED,
        };
      }
    } catch (error) {
      throw new HttpException(
        'No se pudo crear la obra social',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCoverage(): Promise<HttpException | Coverage[] | IResponse> {
    try {
      const coverages = await this.coverageRepository.find();

      if (!coverages.length)
        return {
          message: 'No existen obras sociales registradas',
          statusCode: HttpStatus.NO_CONTENT,
        };
      else {
        return {
          message: 'La lista de obras sociales está compuesta por:',
          data: coverages,
          statusCode: HttpStatus.FOUND,
        };
      }
    } catch (error) {
      throw new HttpException(
        'Ha ocurrido un error.No se pudo traer la lista de obras sociales',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneCoverages(
    id: string,
  ): Promise<HttpException | Coverage | IResponse> {
    try {
      const coverages = await this.coverageRepository.findOne({
        where: { id: id },
      });
      if (!coverages) {
        return {
          message: 'La obra social no fue encontrada',
          statusCode: HttpStatus.CONFLICT,
        };
      }
      return {
        message: 'La obra social encontrada es:',
        data: coverages,
        statusCode: HttpStatus.FOUND,
      };
    } catch (error) {
      throw new HttpException(
        'Ha ocurrido una falla en la busqueda',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async updateCoverages(
    id: string,
    updateCoverages: Partial<UpdateCoverageDto>,
  ): Promise<HttpException | UpdateCoverageDto | IResponse> {
    try {
      const coverages = await this.coverageRepository.findOne({
        where: { id: id },
      });
      if (!coverages) {
        return new HttpException(
          'La obra social no existe en la base de datos',
          HttpStatus.NOT_FOUND,
        );
      }
      await this.coverageRepository.update(id, updateCoverages);
      return {
        message: 'Las modificaciones son las siguientes: ',
        data: { ...updateCoverages, datosAnteriores: coverages },
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(
        'No se pudo actualizar la obra social',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteCoverage(
    id: string,
  ): Promise<HttpException | Coverage | IResponse> {
    try {
      const coverages = await this.coverageRepository.findOne({
        where: { id: id },
      });
      if (!coverages) {
        return new HttpException(
          'La especialidad no existe en la base de datos',
          HttpStatus.NOT_FOUND,
        );
      }
      await this.coverageRepository.delete({ id: id });
      return {
        message: 'Se ha eliminado la obra social: ',
        data: coverages.coverages,
        statusCode: HttpStatus.MOVED_PERMANENTLY,
      };
    } catch (error) {
      throw new HttpException(
        'No se pudo eliminar la obra social',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
