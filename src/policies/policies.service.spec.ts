import { Test, TestingModule } from '@nestjs/testing';
import { PoliciesService } from './policies.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Policy, PolicyStatus } from './entities/policy.entity';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Between, FindOptionsWhere } from 'typeorm';

type RepoMock = {
  find: jest.Mock<Promise<Policy[]>, [any?]>;
  findOne: jest.Mock<Promise<Policy | null>, [any?]>;
  exist: jest.Mock<Promise<boolean>, [any?]>;
  create: jest.Mock<Policy, [Partial<Policy>]>;
  save: jest.Mock<Promise<Policy>, [Policy]>;
};

const repoMock = (): RepoMock => ({
  find: jest.fn<Promise<Policy[]>, [any?]>(),
  findOne: jest.fn<Promise<Policy | null>, [any?]>(),
  exist: jest.fn<Promise<boolean>, [any?]>(),
  create: jest.fn<Policy, [Partial<Policy>]>(),
  save: jest.fn<Promise<Policy>, [Policy]>(),
});

describe('PoliciesService', () => {
  let service: PoliciesService;
  let repo: RepoMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoliciesService,
        { provide: getRepositoryToken(Policy), useFactory: repoMock },
      ],
    }).compile();

    service = module.get(PoliciesService);
    repo = module.get<RepoMock>(getRepositoryToken(Policy));
  });

  function getLastFindArgs(): { where: FindOptionsWhere<Policy>; order: any } {
    const call = repo.find.mock.calls.at(-1);
    return (call?.[0] ?? { where: {}, order: {} }) as {
      where: FindOptionsWhere<Policy>;
      order: any;
    };
  }

  describe('createPolicy', () => {
    it('crea una póliza (camino feliz)', async () => {
      repo.exist.mockResolvedValue(true as never);
      repo.exist.mockResolvedValue(false);
      repo.create.mockImplementation((e: Partial<Policy>) => e as Policy);
      repo.save.mockImplementation((p: Policy) => Promise.resolve(p));

      const res = await service.create({
        rutTitular: '13.757.397-0',
        fechaEmision: '2025-10-22T10:00:00.000Z',
        planSalud: 'Plan Oro',
        prima: 19999.9,
        estado: PolicyStatus.EMITIDA,
      });

      expect(repo.exist).toHaveBeenCalledWith({
        where: { rutTitular: '137573970' },
      });
      expect(repo.save).toHaveBeenCalled();
      expect(res).toMatchObject({ rutTitular: '137573970' });
    });

    it('Lanza ConflictException si el RUT ya existe', async () => {
      repo.exist.mockResolvedValue(true);

      await expect(
        service.create({
          rutTitular: '13.757.397-0',
          fechaEmision: '2025-10-22T10:00:00.000Z',
          planSalud: 'Plan Oro',
          prima: 19999.9,
          estado: PolicyStatus.EMITIDA,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('traduce SQLITE_CONSTRAINT a ConflictException', async () => {
      repo.exist.mockResolvedValue(false);
      repo.create.mockImplementation((e: Partial<Policy>) => e as Policy);
      repo.save.mockRejectedValue({ code: 'SQLITE_CONSTRAINT' });

      await expect(
        service.create({
          rutTitular: '13.757.397-0',
          fechaEmision: '2025-10-22T10:00:00.000Z',
          planSalud: 'Plan Oro',
          prima: 19999.9,
          estado: PolicyStatus.EMITIDA,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('traduce 23505 a ConflictException', async () => {
      repo.exist.mockResolvedValue(false);
      repo.create.mockImplementation((e: Partial<Policy>) => e as Policy);
      repo.save.mockRejectedValue({ code: '23505' });

      await expect(
        service.create({
          rutTitular: '13.757.397-0',
          fechaEmision: '2025-10-22T10:00:00.000Z',
          planSalud: 'Plan Oro',
          prima: 19999.9,
          estado: PolicyStatus.EMITIDA,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('propaga error genérico de save()', async () => {
      repo.exist.mockResolvedValue(false);
      repo.create.mockImplementation((e: Partial<Policy>) => e as Policy);
      const generic = new Error('falló DB');
      repo.save.mockRejectedValue(generic);

      await expect(
        service.create({
          rutTitular: '13.757.397-0',
          fechaEmision: '2025-10-22T10:00:00.000Z',
          planSalud: 'Plan Oro',
          prima: 19999.9,
          estado: PolicyStatus.EMITIDA,
        }),
      ).rejects.toThrow('falló DB');
    });

    it('guarda rutTitular normalizado', async () => {
      repo.exist.mockResolvedValue(false);
      repo.create.mockImplementation((e: Partial<Policy>) => e as Policy);
      repo.save.mockImplementation((p: Policy) => Promise.resolve(p));

      const saved = await service.create({
        rutTitular: '13.757.397-0',
        fechaEmision: '2025-10-22T10:00:00.000Z',
        planSalud: 'Plan Oro',
        prima: 19999.9,
        estado: PolicyStatus.EMITIDA,
      });

      expect(saved.rutTitular).toBe('137573970');
    });
  });

  describe('findAll (filtros)', () => {
    it('filtra por estado', async () => {
      repo.find.mockResolvedValue([
        { id: '1', estado: PolicyStatus.EMITIDA } as Policy,
      ]);

      const res = await service.findAll({ estado: PolicyStatus.EMITIDA });
      expect(repo.find).toHaveBeenCalledWith({
        where: { estado: PolicyStatus.EMITIDA },
        order: { fechaEmision: 'DESC' },
      });
      expect(res).toHaveLength(1);
    });

    it('filtra por rango de fechas (desde/hasta)', async () => {
      repo.find.mockResolvedValue([]);
      await service.findAll({ desde: '2025-10-21', hasta: '2025-10-23' });

      const args = getLastFindArgs();
      expect(args.where.fechaEmision).toEqual(
        Between(new Date('2025-10-21'), new Date('2025-10-23')),
      );
    });

    it('combina estado + fechas', async () => {
      repo.find.mockResolvedValue([]);
      await service.findAll({
        estado: PolicyStatus.ACTIVA,
        desde: '2025-01-01',
        hasta: '2025-12-31',
      });

      const args = getLastFindArgs();
      expect(args.where.estado).toBe(PolicyStatus.ACTIVA);
      expect(args.where.fechaEmision).toEqual(
        Between(new Date('2025-01-01'), new Date('2025-12-31')),
      );
    });

    it('si desde > hasta, hace swap en Between', async () => {
      repo.find.mockResolvedValue([]);
      await service.findAll({ desde: '2025-12-31', hasta: '2025-01-01' });

      const args = getLastFindArgs();
      // @ts-expect-error: _value es interno de TypeORM pero estable para test
      expect(args.where.fechaEmision._value).toEqual([
        new Date('2025-01-01'),
        new Date('2025-12-31'),
      ]);
    });

    it('sin filtros llama repo.find con where {}', async () => {
      repo.find.mockResolvedValue([]);
      await service.findAll();

      expect(repo.find).toHaveBeenCalledWith({
        where: {},
        order: { fechaEmision: 'DESC' },
      });
    });

    it('ignora estado inválido', async () => {
      repo.find.mockResolvedValue([]);
      await service.findAll({ estado: 'otro' as unknown as PolicyStatus });

      const args = getLastFindArgs();
      expect(args.where).toEqual({});
    });

    it('normaliza estado en minúsculas (EMITIDA -> emitida)', async () => {
      repo.find.mockResolvedValue([]);
      await service.findAll({ estado: 'EMITIDA' as PolicyStatus });

      const args = getLastFindArgs();
      expect(args.where.estado).toBe(PolicyStatus.EMITIDA);
    });
  });

  describe('findOne', () => {
    it('retorna la póliza por id', async () => {
      repo.findOne.mockResolvedValue({ id: 'abc' } as Policy);
      await expect(service.findOne('abc')).resolves.toEqual({ id: 'abc' });
    });

    it('lanza NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('emitida -> activa (válida)', async () => {
      repo.findOne.mockResolvedValue({
        id: 'p1',
        estado: PolicyStatus.EMITIDA,
      } as Policy);
      repo.save.mockImplementation((p: Policy) => Promise.resolve(p));

      const res = await service.updateStatus('p1', {
        estado: PolicyStatus.ACTIVA,
      });
      expect(res.estado).toBe(PolicyStatus.ACTIVA);
      expect(repo.save).toHaveBeenCalled();
    });

    it('emitida -> anulada (inválida)', async () => {
      repo.findOne.mockResolvedValue({
        id: 'p1',
        estado: PolicyStatus.EMITIDA,
      } as Policy);
      await expect(
        service.updateStatus('p1', { estado: PolicyStatus.ANULADA }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('activa -> anulada (válida)', async () => {
      repo.findOne.mockResolvedValue({
        id: 'p2',
        estado: PolicyStatus.ACTIVA,
      } as Policy);
      repo.save.mockImplementation((p: Policy) => Promise.resolve(p));

      const res = await service.updateStatus('p2', {
        estado: PolicyStatus.ANULADA,
      });
      expect(res.estado).toBe(PolicyStatus.ANULADA);
    });

    it('anulada -> activa (inválida)', async () => {
      repo.findOne.mockResolvedValue({
        id: 'p3',
        estado: PolicyStatus.ANULADA,
      } as Policy);
      await expect(
        service.updateStatus('p3', { estado: PolicyStatus.ACTIVA }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
