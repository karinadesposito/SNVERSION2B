import { PartialType } from '@nestjs/mapped-types';
import { CreateShiffDto } from './create-shiff.dto';

export class UpdateShiffDto extends PartialType(CreateShiffDto) {}
