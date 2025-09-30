import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestIntent } from './entities/request-intent.entity';
import { IdempotencyService } from './services/idempotency.service';

@Module({
  imports: [TypeOrmModule.forFeature([RequestIntent])],
  providers: [IdempotencyService],
  exports: [IdempotencyService],
})
export class IdempotencyModule {}
