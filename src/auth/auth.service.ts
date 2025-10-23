import {
  Inject,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { UserProvider } from './user.provider';
import { USER_PROVIDER } from './user.provider';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    @Inject(USER_PROVIDER) private readonly users: UserProvider,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    if (!user.isActive) throw new ForbiddenException('Usuario inactivo');
    const ok = await bcrypt.compare(pass, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');
    return user;
  }

  async login(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email };
    return { access_token: await this.jwt.signAsync(payload) };
  }
}
