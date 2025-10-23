import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyStatusDto } from './dto/update-policy-status.dto';
import { ListPoliciesQueryDto } from './dto/list-policies.query.dto';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PolicyStatus } from './entities/policy.entity';

@Controller('policies')
export class PoliciesController {
  constructor(private readonly service: PoliciesService) {}

  @Post()
  @ApiOperation({ summary: 'Creación de nuevas pólizas' })
  create(@Body() dto: CreatePolicyDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listado y búsqueda con filtros por estado y rango de fechas',
  })
  @ApiQuery({ name: 'estado', required: false, enum: PolicyStatus })
  @ApiQuery({
    name: 'desde',
    required: false,
    type: String,
    example: '2025-10-01',
  })
  @ApiQuery({
    name: 'hasta',
    required: false,
    type: String,
    example: '2025-10-30',
  })
  findAll(@Query() q: ListPoliciesQueryDto) {
    return this.service.findAll(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta de póliza individual' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Actualización del estado de la póliza' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdatePolicyStatusDto) {
    return this.service.updateStatus(id, dto);
  }
}
