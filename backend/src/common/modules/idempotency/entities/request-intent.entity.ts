import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('idempotency_keys')
export class RequestIntent {
  @PrimaryColumn({ type: 'uuid', name: 'idempotency_key' })
  idempotencyKey: string;

  @Column({ type: 'text', nullable: true, name: 'request_hash' })
  requestHash: string | null = null;

  @Column({ type: 'uuid', nullable: true, name: 'entity_id' })
  entityId: string | null = null;
}
