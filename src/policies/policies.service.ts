import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Policy, PolicyStatus } from './entities/policy.entity';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyStatusDto } from './dto/update-policy-status.dto';
import { normalizeRut } from '../common/utils/rut';

type PolicyFilter = {
  estado?: PolicyStatus;
  desde?: string;
  hasta?: string;
};

@Injectable()
export class PoliciesService {
  constructor(
    @InjectRepository(Policy) private readonly repo: Repository<Policy>,
  ) {}

  async create(dto: CreatePolicyDto) {
    const rut = normalizeRut(dto.rutTitular);
    const exists = await this.repo.exist({ where: { rutTitular: rut } });
    if (exists) {
      throw new ConflictException(
        'El RUT ya existe. No se puede registrar otra póliza con el mismo titular.',
      );
    }

    const entity = this.repo.create({
      ...dto,
      rutTitular: rut,
      fechaEmision: new Date(dto.fechaEmision),
    });

    try {
      return await this.repo.save(entity);
    } catch (err: unknown) {
      const code = (err as { code?: unknown })?.code;
      if (code === 'SQLITE_CONSTRAINT' || code === '23505') {
        throw new ConflictException(
          'El RUT ya existe. No se puede registrar otra póliza con el mismo titular.',
        );
      }
      throw err;
    }
  }

  async findAll(filter: PolicyFilter = {}) {
    const where: FindOptionsWhere<Policy> = {};

    if (filter.estado) {
      const estadoLower = String(filter.estado).toLowerCase() as PolicyStatus;
      if ((Object.values(PolicyStatus) as string[]).includes(estadoLower)) {
        where.estado = estadoLower;
      }
    }

    if (filter.desde && filter.hasta) {
      const desde = new Date(filter.desde);
      const hasta = new Date(filter.hasta);
      where.fechaEmision =
        desde <= hasta ? Between(desde, hasta) : Between(hasta, desde);
    }

    return this.repo.find({
      where,
      order: { fechaEmision: 'DESC' },
    });
  }

  async findOne(id: string) {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Póliza no encontrada');
    return p;
  }

  async updateStatus(id: string, dto: UpdatePolicyStatusDto) {
    const p = await this.findOne(id);

    const allowed: Record<PolicyStatus, PolicyStatus[]> = {
      [PolicyStatus.EMITIDA]: [PolicyStatus.ACTIVA],
      [PolicyStatus.ACTIVA]: [PolicyStatus.ANULADA],
      [PolicyStatus.ANULADA]: [],
    };
    if (!allowed[p.estado].includes(dto.estado)) {
      throw new BadRequestException(
        `Transición inválida desde ${p.estado} a ${dto.estado}`,
      );
    }

    p.estado = dto.estado;
    return this.repo.save(p);
  }
}
