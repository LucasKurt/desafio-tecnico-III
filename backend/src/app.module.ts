import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { baseTypeOrmOptions } from './database/typeorm.options';
import { PatientsModule } from './patients/patients.module';
import { DiagnosticsModule } from './diagnostics/diagnostics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...baseTypeOrmOptions(),
        autoLoadEntities: true,
        synchronize: false,
        logging: true,
      }),
    }),
    PatientsModule,
    DiagnosticsModule,
  ],
})
export class AppModule {}
