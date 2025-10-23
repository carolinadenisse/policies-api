import { Test } from '@nestjs/testing';
import { PoliciesController } from './policies.controller';
import { PoliciesService } from './policies.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { ListPoliciesQueryDto } from './dto/list-policies.query.dto';
import { UpdatePolicyStatusDto } from './dto/update-policy-status.dto';
import { PolicyStatus } from './entities/policy.entity';

describe('PoliciesController', () => {
  let controller: PoliciesController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    updateStatus: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [PoliciesController],
      providers: [{ provide: PoliciesService, useValue: service }],
    }).compile();

    controller = module.get(PoliciesController);
    jest.clearAllMocks();
  });

  it('create delega y retorna', async () => {
    const dto: CreatePolicyDto = {
      rutTitular: '13.757.397-0',
      fechaEmision: '2025-10-22T10:00:00.000Z',
      planSalud: 'Plan Oro',
      prima: 19999.9,
      estado: PolicyStatus.EMITIDA,
    };
    service.create.mockResolvedValue({ id: 'uuid', ...dto });

    const res = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ id: 'uuid', ...dto });
  });

  it('findAll sin filtros', async () => {
    const q = {} as ListPoliciesQueryDto;
    service.findAll.mockResolvedValue([]);

    const res = await controller.findAll(q);
    expect(service.findAll).toHaveBeenCalledWith(q);
    expect(res).toEqual([]);
  });

  it('findAll con filtros', async () => {
    const q: ListPoliciesQueryDto = {
      estado: PolicyStatus.EMITIDA,
      desde: '2025-10-01',
      hasta: '2025-10-31',
    };
    service.findAll.mockResolvedValue([{ id: '1' }]);

    const res = await controller.findAll(q);
    expect(service.findAll).toHaveBeenCalledWith(q);
    expect(res).toEqual([{ id: '1' }]);
  });

  it('findOne delega', async () => {
    service.findOne.mockResolvedValue({ id: 'abc' });
    await expect(controller.findOne('abc')).resolves.toEqual({ id: 'abc' });
    expect(service.findOne).toHaveBeenCalledWith('abc');
  });

  it('updateStatus delega', async () => {
    const dto: UpdatePolicyStatusDto = { estado: PolicyStatus.ANULADA };
    service.updateStatus.mockResolvedValue({
      id: 'p1',
      estado: PolicyStatus.ANULADA,
    });

    const res = await controller.updateStatus('p1', dto);
    expect(service.updateStatus).toHaveBeenCalledWith('p1', dto);
    expect(res).toEqual({ id: 'p1', estado: PolicyStatus.ANULADA });
  });
});
