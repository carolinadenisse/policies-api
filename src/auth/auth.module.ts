import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { InMemoryUserProvider, USER_PROVIDER } from './user.provider';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const secret = cfg.get<string>('JWT_SECRET') ?? 'change-me';
        const expiresRaw = cfg.get<string>('JWT_EXPIRES') ?? '86400';
        const expiresIn = parseInt(expiresRaw, 10);

        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: USER_PROVIDER, useClass: InMemoryUserProvider },
  ],
  exports: [AuthService],
})
export class AuthModule {}
