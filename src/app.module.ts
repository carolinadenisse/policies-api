import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoliciesModule } from './policies/policies.module';
import { AuthModule } from './auth/auth.module';
import { Policy } from './policies/entities/policy.entity';
import { User } from './auth/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'sqlite',
        database: cfg.get<string>('DB_DATABASE'),
        entities: [Policy, User],
        synchronize: true,
        logging: false,
      }),
    }),
    AuthModule,
    PoliciesModule,
  ],
})
export class AppModule {}
