import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  HttpException,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { Doctor } from './entities/doctor.entity';
import { IResponse } from '../interface/IResponse';
import { AddCoverageToDoctorDto } from '../coverage/dto/add-coverage.dto';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
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
  DoctorsTwo(
    @Param('idDoctor') idDoctor: number,
  ): Promise<HttpException | Doctor[] | IResponse> {
    return this.doctorsService.getDoctorsShiff(idDoctor);
  }
  @Get('/shiffUnAvailable/:idDoctor')
  DoctorsThree(
    @Param('idDoctor') idDoctor: number,
  ): Promise<HttpException | Doctor[] | IResponse> {
    return this.doctorsService.getDoctorsUnAvailable(idDoctor);
  }
  @Get(':id')
  findOneDoctor(
    @Param('id') id: number,
  ): Promise<HttpException | Doctor | IResponse> {
    return this.doctorsService.findOneDoctor(id);
  }

  @Put(':id')
  updateDoctor(
    @Body() updateDoctor: Partial<UpdateDoctorDto>,
    @Param('id') id: number,
  ): Promise<HttpException | UpdateDoctorDto | IResponse> {
    return this.doctorsService.updateDoctor(id, updateDoctor);
  }

  @Delete(':id')
  deleteDoctor(
    @Param('id') id: number,
  ): Promise<HttpException | Doctor | IResponse> {
    return this.doctorsService.deleteDoctor(id);
  }

  @Post('/addCoverage')
  async addCoverageToDoctor(
    @Body() addCoverageToDoctorDto: AddCoverageToDoctorDto,
  ): Promise<HttpException | Doctor | IResponse> {
    return this.doctorsService.addCoverageToDoctor(addCoverageToDoctorDto);
  } 

  @Delete('/remove/coverage')
  async removeCoverageFromDoctor(
    @Body() doctorData: AddCoverageToDoctorDto,
  ): Promise<Doctor | IResponse> {
    return await this.doctorsService.removeCoverageFromDoctor(doctorData);
  }
  @Get('/patients/:id')
  getPatientsByDoctorId(@Param('id') doctorId: number) {
    return this.doctorsService.findPatientsByDoctorId(doctorId);
  }

  @Get('speciality/:sname')
  findBySpeciality(
    @Param('sname') specialityName: string,
  ): Promise<HttpException | Doctor[] | IResponse> {
    return this.doctorsService.findBySpeciality(specialityName);
  }
}
