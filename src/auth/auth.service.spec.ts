import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AdminService } from '../admin/admin.service';
import { JwtService } from '@nestjs/jwt';
import { Admin } from '../admin/entities/admin.entity';

describe('AuthService', () => {
  let service: AuthService;
  let adminService: AdminService;
  let jwtService: JwtService;

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
});