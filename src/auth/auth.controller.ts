import { Controller, HttpCode, HttpStatus, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Admin } from '../admin/entities/admin.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() admin: Admin) {
    return this.authService.login(admin);
  }
}
