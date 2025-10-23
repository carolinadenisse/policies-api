import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export interface UserProvider {
  findByEmail(email: string): Promise<{
    id: string;
    email: string;
    passwordHash: string;
    isActive: boolean;
  } | null>;
}

@Injectable()
export class InMemoryUserProvider implements UserProvider {
  private user = {
    id: 'u1',
    email: 'demo@demo.com',
    passwordHash: bcrypt.hashSync('Demo123!', 10),
    isActive: true,
  };

  findByEmail(email: string) {
    return Promise.resolve(email === this.user.email ? this.user : null);
  }
}

export const USER_PROVIDER = 'USER_PROVIDER';
