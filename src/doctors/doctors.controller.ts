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
  @Get('/shiftAvailable/:idDoctor')
  DoctorsTwo(
    @Param('idDoctor') idDoctor: string,
  ): Promise<HttpException | Doctor[] | IResponse> {
    return this.doctorsService.getDoctorsShift(idDoctor);
  }
  @Get('/shiftUnAvailable/:idDoctor')
  DoctorsThree(
    @Param('idDoctor') idDoctor: string,
  ): Promise<HttpException | Doctor[] | IResponse> {
    return this.doctorsService.getDoctorsUnAvailable(idDoctor);
  }
  @Get(':id')
  findOneDoctor(
    @Param('id') id: string,
  ): Promise<HttpException | Doctor | IResponse> {
    return this.doctorsService.findOneDoctor(id);
  }

  @Put(':id')
  updateDoctor(
    @Body() updateDoctor: Partial<UpdateDoctorDto>,
    @Param('id') id: string,
  ): Promise<HttpException | UpdateDoctorDto | IResponse> {
    return this.doctorsService.updateDoctor(id, updateDoctor);
  }

  @Delete(':id')
  deleteDoctor(
    @Param('id') id: string,
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
  ): Promise<Doctor> {
    return await this.doctorsService.removeCoverageFromDoctor(doctorData);
  }
  @Get('/patients/:id')
  getPatientsByDoctorId(@Param('id') doctorId: string) {
    return this.doctorsService.findPatientsByDoctorId(doctorId);
  }

  @Get('speciality/:sname')
  findBySpeciality(
    @Param('sname') specialityName: string,
  ): Promise<HttpException | Doctor[] | IResponse> {
    return this.doctorsService.findBySpeciality(specialityName);
  }
}
