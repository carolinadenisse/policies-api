import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const mockService = {
    validateUser: jest
      .fn()
      .mockResolvedValue({ id: 'u1', email: 'demo@demo.com' }),
    login: jest.fn().mockResolvedValue({ access_token: 'jwt' }),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockService }],
    }).compile();

    controller = module.get(AuthController);
    jest.clearAllMocks();
  });

  it('debe retornar el token de acceso', async () => {
    const dto: LoginDto = {
      email: 'demo@demo.com',
      password: 'Demo123!',
    };
    const result = await controller.login(dto);
    expect(mockService.validateUser).toHaveBeenCalledWith(
      'demo@demo.com',
      'Demo123!',
    );
    expect(mockService.login).toHaveBeenCalled();
    expect(result).toEqual({ access_token: 'jwt' });
  });
});
