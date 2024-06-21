import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CreateCoverageDto } from './dto/create-coverage.dto';
import { UpdateCoverageDto } from './dto/update-coverage.dto';
import { CoveragesService } from './coverage.service';

@Controller('coverage')
export class CoveragesController {
  constructor(private readonly coverageService: CoveragesService) {}

  @Post()
  create(@Body() createCoveragesDto: CreateCoverageDto) {
    return this.coverageService.create(createCoveragesDto);
  }

  @Get()
  findAll() {
    return this.coverageService.getCoverage();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.coverageService.findOneCoverages(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateCoverageDto: UpdateCoverageDto,
  ) {
    return this.coverageService.updateCoverages(id, updateCoverageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.coverageService.deleteCoverage(id);
  }
}
