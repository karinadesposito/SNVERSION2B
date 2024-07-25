import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateCoverageDto } from './dto/create-coverage.dto';
import { UpdateCoverageDto } from './dto/update-coverage.dto';
import { CoveragesService } from './coverage.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('coverage')
export class CoveragesController {
  constructor(private readonly coverageService: CoveragesService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createCoveragesDto: CreateCoverageDto) {
    return this.coverageService.create(createCoveragesDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.coverageService.getCoverage();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: number) {
    return this.coverageService.findOneCoverages(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: number,
    @Body() updateCoverageDto: UpdateCoverageDto,
  ) {
    return this.coverageService.updateCoverages(id, updateCoverageDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: number) {
    return this.coverageService.deleteCoverage(id);
  }
}
