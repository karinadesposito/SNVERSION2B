import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { Doctor } from './entities/doctor.entity';
import { IResponse } from '../interface/IResponse';
import { AddCoverageToDoctorDto } from '../coverage/dto/add-coverage.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Body() newDoctor: CreateDoctorDto,
  ): Promise<HttpException | CreateDoctorDto | IResponse> {
    return this.doctorsService.create(newDoctor);
  }

  @Get()
  Doctors(): Promise<HttpException | Doctor[] | IResponse> {
    return this.doctorsService.getDoctors();
  }
  @Get('/shiffAvailable/:idDoctor')
  @UseGuards(AuthGuard)
  DoctorsTwo(
    @Param('idDoctor') idDoctor: number,
  ): Promise<HttpException | Doctor[] | IResponse> {
    return this.doctorsService.getDoctorsShiff(idDoctor);
  }
  @Get(':id')
  @UseGuards(AuthGuard)
  findOneDoctor(
    @Param('id') id: number,
  ): Promise<HttpException | Doctor | IResponse> {
    return this.doctorsService.findOneDoctor(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  updateDoctor(
    @Body() updateDoctor: Partial<UpdateDoctorDto>,
    @Param('id') id: number,
  ): Promise<HttpException | UpdateDoctorDto | IResponse> {
    return this.doctorsService.updateDoctor(id, updateDoctor);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  deleteDoctor(
    @Param('id') id: number,
  ): Promise<HttpException | Doctor | IResponse> {
    return this.doctorsService.deleteDoctor(id);
  }

  @Post('/addCoverage')
  @UseGuards(AuthGuard)
  async addCoverageToDoctor(
    @Body() addCoverageToDoctorDto: AddCoverageToDoctorDto,
  ): Promise<HttpException | Doctor | IResponse> {
    return this.doctorsService.addCoverageToDoctor(addCoverageToDoctorDto);
  } 

  @Delete('/remove/coverage')
  @UseGuards(AuthGuard)
  async removeCoverageFromDoctor(
    @Body() doctorData: AddCoverageToDoctorDto,
  ): Promise<Doctor | IResponse> {
    return await this.doctorsService.removeCoverageFromDoctor(doctorData);
  }
  @Get('/patients/:id')
  @UseGuards(AuthGuard)
  getPatientsByDoctorId(@Param('id') doctorId: number) {
    return this.doctorsService.findPatientsByDoctorId(doctorId);
  }

}
