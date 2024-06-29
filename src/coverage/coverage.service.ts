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
        throw new HttpException(
          `La obra social con nombre ${nameFound.coverages} ya existe en la base de datos`,
          HttpStatus.CONFLICT,
        );
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
      if (error.status === HttpStatus.CONFLICT) {
        throw error;
      }
      throw new HttpException(
        'Error del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCoverage(): Promise<HttpException | Coverage[] | IResponse> {
    try {
      const coverages = await this.coverageRepository.find();

      if (!coverages.length)
        throw new HttpException(
          "No existen obras sociales registradas",
          HttpStatus.NOT_FOUND,
        );
      else {
        return {
          message: 'La lista de obras sociales está compuesta por:',
          data: coverages,
          statusCode: HttpStatus.OK,
        };
      }
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

  async findOneCoverages(
    id: number,
  ): Promise<HttpException | Coverage | IResponse> {
    try {
      const coverages = await this.coverageRepository.findOne({
        where: { id: id },
      });
      if (!coverages) {
        throw new HttpException(
          'La obra social no fue encontrada',
          HttpStatus.CONFLICT,
        );
      }
      return {
        message: 'La obra social encontrada es:',
        data: coverages,
        statusCode: HttpStatus.OK,
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
  async updateCoverages(
    id: number,
    updateCoverages: Partial<UpdateCoverageDto>,
  ): Promise<HttpException | Coverage | IResponse> {
    try {
      const coverages = await this.coverageRepository.findOne({
        where: { id: id },
      });

      if (!coverages) {
        throw new HttpException(
          'La obra social no existe en la base de datos',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.coverageRepository.update(id, updateCoverages);

      return {
        message: 'Las modificaciones son las siguientes:',
        data: { ...updateCoverages, datosAnteriores: coverages },
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

  async deleteCoverage(
    id: number,
  ): Promise<HttpException | Coverage | IResponse> {
    try {
      const coverages = await this.coverageRepository.findOne({
        where: { id: id },
      });
      if (!coverages) {
        throw new HttpException(
          'La cobertura no existe en la base de datos',
          HttpStatus.NOT_FOUND,
        );
      }
      await this.coverageRepository.delete({ id: id });
      throw new HttpException(
        'Se ha eliminado la obra social: ',
        HttpStatus.MOVED_PERMANENTLY,
      );
    } catch (error) {
      if (error.status === HttpStatus.MOVED_PERMANENTLY || HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new HttpException(
        'Error del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
