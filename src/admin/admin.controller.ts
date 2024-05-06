import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

type ResponseMessage = { message: string; data?: {}; statusCode: HttpStatus };

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('/login')
  create(
    @Body() newAdmin: CreateAdminDto,
  ): Promise<HttpException | CreateAdminDto | ResponseMessage> {
    return this.adminService.create(newAdmin);
  }
  @Get()
  findOneAdmin(@Param('email') email: string) {
    return this.adminService.findByEmail(email);
  }
}
