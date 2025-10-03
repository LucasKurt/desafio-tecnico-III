import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1759500456288 implements MigrationInterface {
  name = 'Auto1759500456288';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_5947301223f5a908fd5e372b0f"`);
    await queryRunner.query(`CREATE INDEX "IDX_patients_name" ON "patients" ("name") `);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_patients_cpf" ON "patients" ("cpf") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_patients_cpf"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_patients_name"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5947301223f5a908fd5e372b0f" ON "patients" ("cpf") `,
    );
  }
}
