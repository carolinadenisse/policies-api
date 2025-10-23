import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

export enum PolicyStatus {
  EMITIDA = 'emitida',
  ACTIVA = 'activa',
  ANULADA = 'anulada',
}

@Entity()
export class Policy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  rutTitular: string;

  @Column({ type: 'datetime' })
  fechaEmision: Date;

  @Column()
  planSalud: string;

  @Column('decimal', { precision: 10, scale: 2 })
  prima: number;

  @Column({ type: 'text', default: PolicyStatus.EMITIDA })
  estado: PolicyStatus;
}
