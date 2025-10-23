import { InMemoryUserProvider } from './user.provider';
import * as bcrypt from 'bcrypt';

describe('InMemoryUserProvider', () => {
  let provider: InMemoryUserProvider;

  beforeEach(() => {
    provider = new InMemoryUserProvider();
  });

  it('A) debe tener un usuario demo inicial con hash de password', () => {
    expect(provider['user'].email).toBe('demo@demo.com');
    expect(provider['user'].isActive).toBe(true);
    expect(provider['user'].passwordHash).not.toBe('Demo123!');
    expect(bcrypt.compareSync('Demo123!', provider['user'].passwordHash)).toBe(
      true,
    );
  });

  it('B) retorna el usuario si el email coincide', async () => {
    const result = await provider.findByEmail('demo@demo.com');
    expect(result).toBeDefined();
    expect(result?.email).toBe('demo@demo.com');
  });

  it('C) retorna null si el email no coincide', async () => {
    const result = await provider.findByEmail('otro@correo.com');
    expect(result).toBeNull();
  });
});
