import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { RequestIntent } from '../entities/request-intent.entity';

@Injectable()
export class IdempotencyService {
  async ensureAndLockTx(em: EntityManager, idempotencyKey: string): Promise<RequestIntent> {
    await em
      .createQueryBuilder()
      .insert()
      .into(RequestIntent)
      .values({ idempotencyKey })
      .orIgnore()
      .execute();

    const row = await em
      .getRepository(RequestIntent)
      .createQueryBuilder('k')
      .setLock('pessimistic_write')
      .where('k.idempotencyKey = :idempotencyKey', { idempotencyKey })
      .getOne();

    // istanbul ignore next
    if (!row) throw new Error('Idempotency key row not found after insert');

    return row;
  }

  async finalizeTx(
    em: EntityManager,
    idempotencyKey: string,
    opts: { requestHash: string; entityId: string },
  ): Promise<void> {
    await em
      .createQueryBuilder()
      .update(RequestIntent)
      .set({ requestHash: opts.requestHash, entityId: opts.entityId })
      .where('idempotencyKey = :idempotencyKey', { idempotencyKey })
      .execute();
  }
}
