import { PartialType } from '@nestjs/mapped-types';
import { CreateCoverageDto } from './create-coverage.dto';

export class UpdateCoverageDto extends PartialType(CreateCoverageDto) {}
