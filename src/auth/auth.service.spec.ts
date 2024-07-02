import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AdminService } from '../admin/admin.service';
import { JwtService } from '@nestjs/jwt';
import { Admin } from '../admin/entities/admin.entity';
import * as bcrypt from 'bcryptjs';
import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let adminService: AdminService;
  let jwtService: JwtService;
  // se simula un admin con los datos que tiene un Admin
  const admin: Admin = {
    id: 1,
    email: 'admin@saludnet.com',
    password: 'admin123',
    username: 'adminSN',
    createId: function (): void {
      throw new Error('Function not implemented.');
    },
  };

  beforeEach(async () => {
    const mockAdminService = {
      findByEmail: jest.fn(),
    };
    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AdminService, useValue: mockAdminService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    adminService = module.get<AdminService>(AdminService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
//comprobamos que devuelva el token si el inicio de sesion es correcto
    it('should return access token if login is successful', async () => {

//del admin encontrado se crea una version con la contraseña haseada
      const foundAdmin = {
        ...admin,
        password: await bcrypt.hash(admin.password, 10),
        createId: function (): void {
          throw new Error('Function not implemented.');
        },
      };

//se simula la busqueda de admin con el metodo del service de Admin, y resuelve con el admin encontrado
      jest.spyOn(adminService, 'findByEmail').mockResolvedValue(foundAdmin);
//se comparan las contraseñas y resuelve que ambas coinciden
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
// se simula la firma del token y resuelve con un token de acceso
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('access_token');

//se llama al metodo login de authService
      const result = await service.login(admin);

//asegura que se hicieron las llamadas esperadas a los metodos
      expect(adminService.findByEmail).toHaveBeenCalledWith(admin.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        admin.password,
        foundAdmin.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: foundAdmin.id,
        name: foundAdmin.username,
        email: foundAdmin.email,
      });
//asegura que se devuelva el token esperado
      expect(result).toEqual({ access_token: 'access_token' });
    });

//comprobamos que devuelva una HttpException si el admin no es encontrado
    it('should throw HttpException if admin is not found', async () => {

// simulamos la busqueda de mail y resolvemos con null
      jest.spyOn(adminService, 'findByEmail').mockResolvedValue(null);

// aseguramos que la llamada al metodo login lance una excepcion ya que el mail no existe
      await expect(service.login(admin)).rejects.toThrow(
        new HttpException('El administrativo no existe', HttpStatus.NOT_FOUND),
      );

//asegura que se hizo la llamada al metodo del srevice de admin
      expect(adminService.findByEmail).toHaveBeenCalledWith(admin.email);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      // Creamos una versión del admin encontrado con una contraseña incorrecta hasheada
      const foundAdmin = {
        ...admin,
        password: await bcrypt.hash('wrongpassword', 10),
        createId: function (): void {
          throw new Error('Function not implemented.');
        },
      };
    
      // Se simula la búsqueda de admin con el método del service de Admin, y resuelve con el admin encontrado
      jest.spyOn(adminService, 'findByEmail').mockResolvedValue(foundAdmin);
      // Se simula que la comparación de las contraseñas es falsa y falla 
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
    
      // Aseguramos que la llamada a login lance una excepción
      await expect(service.login(admin)).rejects.toThrow(UnauthorizedException);
    
      // Aseguramos que se hayan realizado las llamadas a los métodos
      expect(adminService.findByEmail).toHaveBeenCalledWith(admin.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        admin.password,
        foundAdmin.password,
    )})})});