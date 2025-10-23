import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PolicyStatus } from '../entities/policy.entity';

export class UpdatePolicyStatusDto {
  @ApiProperty({
    description:
      'Nuevo estado de la póliza. Solo se permiten valores válidos del ciclo de vida de la póliza.',
    enum: PolicyStatus,
    example: PolicyStatus.ACTIVA,
  })
  @IsEnum(PolicyStatus, {
    message:
      'El estado debe ser uno de los valores válidos: emitida, activa o anulada.',
  })
  estado: PolicyStatus;
}
