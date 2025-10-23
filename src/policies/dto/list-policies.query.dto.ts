import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional } from 'class-validator';
import { PolicyStatus } from '../entities/policy.entity';

export class ListPoliciesQueryDto {
  @ApiPropertyOptional({
    description: 'Filtra las pólizas por su estado actual',
    enum: PolicyStatus,
    example: PolicyStatus.EMITIDA,
  })
  @IsOptional()
  @IsEnum(PolicyStatus)
  estado?: PolicyStatus;

  @ApiPropertyOptional({
    description:
      'Filtra las pólizas emitidas a partir de esta fecha (formato YYYY-MM-DD)',
    example: '2025-10-21',
  })
  @IsOptional()
  @IsISO8601()
  desde?: string;

  @ApiPropertyOptional({
    description:
      'Filtra las pólizas emitidas hasta esta fecha (formato YYYY-MM-DD)',
    example: '2025-10-23',
  })
  @IsOptional()
  @IsISO8601()
  hasta?: string;
}
