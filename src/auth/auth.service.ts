import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Admin } from 'src/admin/entities/admin.entity';
import { compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from 'src/admin/admin.service';

@Injectable()
export class AuthService {
  constructor(
    private adminService: AdminService,
    private jwtService: JwtService,
  ) {}
  async login(admin: Admin) {
    const userFound = await this.adminService.findByEmail(admin.email);
    if (!(userFound instanceof Admin)) {
      return new HttpException(
        'El administrativo no existe',
        HttpStatus.NOT_FOUND,
      );
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
  }
}
