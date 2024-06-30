import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patient } from './entities/patient.entity';
import { AuthGuard } from '../auth/auth.guard';
import { IResponse } from '../interface/IResponse';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  create(
    @Body() newPatient: CreatePatientDto,
  ): Promise<HttpException | CreatePatientDto | IResponse> {
    return this.patientsService.create(newPatient);
  }

  @Get()
  getPatients(): Promise<UpdatePatientDto[] | IResponse | HttpException> {
    return this.patientsService.getPatients();
  }

  @Get(':id')
  findOne(
    @Param('id') id: number,
  ): Promise<HttpException | UpdatePatientDto | IResponse> {
    return this.patientsService.findOnePatient(id);
  }

  @Put(':id')
  updatePatient(
    @Body() updatePatient: Partial<UpdatePatientDto>,
    @Param('id') id: number,
  ): Promise<HttpException | UpdatePatientDto | IResponse> {
    return this.patientsService.updatePatient(id, updatePatient);
  }
 //@UseGuards(AuthGuard)
  @Delete(':id')
  deletePatient(
    @Param('id') id: number,
  ): Promise<HttpException | Patient | IResponse> {
    return this.patientsService.deletePatient(id);
  }
}
