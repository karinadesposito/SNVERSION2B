import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpException,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patient } from './entities/patient.entity';
type ResponseMessage = { message: string };

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  create(
    @Body() newPatient: CreatePatientDto,
  ): Promise<HttpException | CreatePatientDto | ResponseMessage> {
    return this.patientsService.create(newPatient);
  }

  @Get()
  getPatients(): Promise<UpdatePatientDto[] | ResponseMessage | HttpException> {
    return this.patientsService.getPatients();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ): Promise<HttpException | UpdatePatientDto | ResponseMessage> {
    return this.patientsService.findOnePatient(id);
  }

  @Put(':id')
  updatePatient(
    @Body() updatePatient: Partial<UpdatePatientDto>,
    @Param('id') id: string,
  ): Promise<HttpException | UpdatePatientDto | ResponseMessage> {
    return this.patientsService.updatePatient(id, updatePatient);
  }
  @Delete(':id')
  deletePatient(
    @Param('id') id: string,
  ): Promise<HttpException | Patient | ResponseMessage> {
    return this.patientsService.deletePatient(id);
  }
}
