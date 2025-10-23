import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsISO8601,
  IsNumber,
  IsString,
  Matches,
} from 'class-validator';
import { PolicyStatus } from '../entities/policy.entity';

export class CreatePolicyDto {
  @ApiProperty({
    description: 'RUT del titular de la póliza',
    example: '33.333.333-3',
  })
  @IsString()
  @Matches(/^(\d{1,2}\.\d{3}\.\d{3}-[\dkK])$/, {
    message: 'El RUT debe tener un formato válido, por ejemplo: 12.345.678-9',
  })
  rutTitular: string;

  @ApiProperty({
    description: 'Fecha de emisión de la póliza en formato ISO8601',
    example: '2025-10-22T10:00:00.000Z',
  })
  @IsISO8601()
  fechaEmision: string;

  @ApiProperty({
    description: 'Nombre del plan de salud asociado a la póliza',
    example: 'Plan Oro',
  })
  @IsString()
  planSalud: string;

  @ApiProperty({
    description: 'Prima mensual o monto de la póliza',
    example: 19999.9,
  })
  @IsNumber()
  prima: number;

  @ApiProperty({
    description: 'Estado inicial de la póliza',
    enum: PolicyStatus,
    example: PolicyStatus.EMITIDA,
  })
  @IsEnum(PolicyStatus)
  estado: PolicyStatus;
}
