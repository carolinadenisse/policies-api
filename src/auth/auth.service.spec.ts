import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { USER_PROVIDER } from './user.provider';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService (unit)', () => {
  let service: AuthService;
  let usersMock: { findByEmail: jest.Mock };
  let jwtMock: { signAsync: jest.Mock };
  const compareMock = bcrypt.compare as unknown as jest.Mock;

  beforeEach(async () => {
    usersMock = {
      findByEmail: jest.fn(),
    };
    jwtMock = {
      signAsync: jest.fn().mockResolvedValue('fake.jwt.token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USER_PROVIDER, useValue: usersMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get(AuthService);

    jest.clearAllMocks();
  });

  it('A) falla si el usuario NO existe (Unauthorized)', async () => {
    usersMock.findByEmail.mockResolvedValue(null);
    await expect(
      service.validateUser('no@demo.com', 'x'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(usersMock.findByEmail).toHaveBeenCalledWith('no@demo.com');
  });

  it('B) falla si el usuario está inactivo (Forbidden)', async () => {
    usersMock.findByEmail.mockResolvedValue({
      id: 'u1',
      email: 'demo@demo.com',
      passwordHash: 'hash',
      isActive: false,
    });
    await expect(
      service.validateUser('demo@demo.com', 'Demo123!'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(compareMock).not.toHaveBeenCalled();
  });

  it('C) falla si la contraseña es inválida (Unauthorized)', async () => {
    usersMock.findByEmail.mockResolvedValue({
      id: 'u1',
      email: 'demo@demo.com',
      passwordHash: 'hash',
      isActive: true,
    });
    compareMock.mockResolvedValue(false);

    await expect(
      service.validateUser('demo@demo.com', 'wrong'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(compareMock).toHaveBeenCalledWith('wrong', 'hash');
  });

  it('D) pasa con credenciales válidas', async () => {
    usersMock.findByEmail.mockResolvedValue({
      id: 'u1',
      email: 'demo@demo.com',
      passwordHash: 'hash',
      isActive: true,
    });
    compareMock.mockResolvedValue(true);

    const user = await service.validateUser('demo@demo.com', 'Demo123!');
    expect(user).toMatchObject({ email: 'demo@demo.com', isActive: true });
    expect(compareMock).toHaveBeenCalledWith('Demo123!', 'hash');
  });

  it('E) login firma y retorna token', async () => {
    const token = await service.login({ id: 'u1', email: 'demo@demo.com' });
    expect(jwtMock.signAsync).toHaveBeenCalledWith({
      sub: 'u1',
      email: 'demo@demo.com',
    });
    expect(token).toEqual({ access_token: 'fake.jwt.token' });
  });

  it('F) login maneja error de firma (rama de excepción)', async () => {
    jwtMock.signAsync.mockRejectedValueOnce(new Error('firma fallida'));
    await expect(
      service.login({ id: 'u1', email: 'demo@demo.com' }),
    ).rejects.toThrow('firma fallida');
  });
});
