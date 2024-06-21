import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Admin } from '../admin/entities/admin.entity';
import { HttpStatus, HttpException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  const admin: Admin = { email: 'juanperez@gmail.com', password: '123',id:1, username:"juanperez", createId:jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return an access token on successful login', async () => {
      const result = { access_token: 'jwt-token' };

      jest.spyOn(authService, 'login').mockImplementation(async () => result);

      expect(await authController.login(admin)).toBe(result);
    });

    it('should throw an exception if login fails', async () => {
  
      jest.spyOn(authService, 'login').mockImplementation(async () => {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      });

      await expect(authController.login(admin)).rejects.toThrow(HttpException);
    });
  });
});
