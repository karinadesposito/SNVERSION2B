import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { Admin } from './entities/admin.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
type ResponseMessage = { message: string; data?: {}; statusCode: HttpStatus };

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  async create(
    admin: CreateAdminDto,
  ): Promise<HttpException | CreateAdminDto | ResponseMessage> {
    try {
      const adminFound = await this.adminRepository.findOne({
        where: { username: admin.username },
      });

      if (adminFound) {
        return {
          message: `El administrador con username ${adminFound.username} ya existe en la base de datos`,
          statusCode: HttpStatus.CONFLICT,
        };
      }
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      const newAdmin = this.adminRepository.create({
        ...admin,
        password: hashedPassword,
      });

      const savedAdmin = await this.adminRepository.save(newAdmin);

      if (savedAdmin) {
        return {
          message: `El administrador ha sido creado exitosamente`,
          data: savedAdmin,
          statusCode: HttpStatus.CREATED,
        };
      }
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'No se pudo crear al administrador',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByEmail(email: string) {
    const user = await this.adminRepository.findOne({
      where: { email: email },
    });
    if (!user) {
      return new HttpException('Admin not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }
}
