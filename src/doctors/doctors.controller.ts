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
type ResponseMessage = { message: string };

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  create(
    @Body() newDoctor: CreateDoctorDto,
  ): Promise<HttpException | CreateDoctorDto | ResponseMessage> {
    return this.doctorsService.create(newDoctor);
  }

  @Get()
  Doctors(): Promise<HttpException | Doctor[] | ResponseMessage> {
    return this.doctorsService.getDoctors();
  }
  @Get('/shiftAvailable/:idDoctor')
  DoctorsTwo(
    @Param('idDoctor') idDoctor: string,
  ): Promise<HttpException | Doctor[] | ResponseMessage> {
    return this.doctorsService.getDoctorsShift(idDoctor);
  }
  @Get('/shiftUnAvailable/:idDoctor')
  DoctorsThree(
    @Param('idDoctor') idDoctor: string,
  ): Promise<HttpException | Doctor[] | ResponseMessage> {
    return this.doctorsService.getDoctorsUnAvailable(idDoctor);
  }
  @Get(':id')
  findOneDoctor(
    @Param('id') id: string,
  ): Promise<HttpException | Doctor | ResponseMessage> {
    return this.doctorsService.findOneDoctor(id);
  }

  @Put(':id')
  updateDoctor(
    @Body() updateDoctor: Partial<UpdateDoctorDto>,
    @Param('id') id: string,
  ): Promise<HttpException | UpdateDoctorDto | ResponseMessage> {
    return this.doctorsService.updateDoctor(id, updateDoctor);
  }

  @Delete(':id')
  deleteDoctor(
    @Param('id') id: string,
  ): Promise<HttpException | Doctor | ResponseMessage> {
    return this.doctorsService.deleteDoctor(id);
  }


  @Put('/restore/:id')
  restoreDoctor(
    @Param('id') id: string,
  ): Promise<HttpException | Doctor | ResponseMessage> {
    return this.doctorsService.restoreDoctor(id);
  }
}
