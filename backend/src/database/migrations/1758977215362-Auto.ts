import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1758977215362 implements MigrationInterface {
  name = 'Auto1758977215362';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "patients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(120) NOT NULL, "birth_date" date NOT NULL, "cpf" character varying(11) NOT NULL, CONSTRAINT "PK_a7f0b9fcbb3469d5ec0b0aceaa7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5947301223f5a908fd5e372b0f" ON "patients" ("cpf") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_5947301223f5a908fd5e372b0f"`);
    await queryRunner.query(`DROP TABLE "patients"`);
  }
}
