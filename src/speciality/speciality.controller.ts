import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { SpecialityService } from './speciality.service';
import { CreateSpecialityDto } from './dto/create-speciality.dto';
import { UpdateSpecialityDto } from './dto/update-speciality.dto';

@Controller('speciality')
export class SpecialityController {
  constructor(private readonly specialityService: SpecialityService) {}

  @Post()
  create(@Body() createSpecialityDto: CreateSpecialityDto) {
    return this.specialityService.create(createSpecialityDto);
  }

  @Get()
  findAll() {
    return this.specialityService.getSpeciality();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.specialityService.findOneSpeciality(id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateSpecialityDto: UpdateSpecialityDto,
  ) {
    return this.specialityService.updateSpeciality(id, updateSpecialityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.specialityService.deleteSpeciality(id);
  }

}
