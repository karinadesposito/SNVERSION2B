import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Admin } from '../admin/entities/admin.entity';
import { compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class AuthService {
  constructor(
    private adminService: AdminService,
    private jwtService: JwtService,
  ) {}

  async login(admin: Admin) {
    try {
      const userFound = await this.adminService.findByEmail(admin.email);
      if (!userFound) {
        throw new HttpException('El administrativo no existe', HttpStatus.NOT_FOUND);
      }
      const { password } = userFound;
      const isPasswordValid = await compare(admin.password, password);
      if (!isPasswordValid) {
        throw new UnauthorizedException();
      }
      const payload = {
        sub: userFound.id,
        name: userFound.username,
        email: userFound.email,
      };
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; 
      }
      throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
}