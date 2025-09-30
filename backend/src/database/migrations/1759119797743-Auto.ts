import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1759119797743 implements MigrationInterface {
  name = 'Auto1759119797743';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."diagnostics_modality_enum" AS ENUM('CR', 'CT', 'DX', 'MG', 'MR', 'NM', 'OT', 'PT', 'RF', 'US', 'XA')`,
    );
    await queryRunner.query(
      `CREATE TABLE "diagnostics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "modality" "public"."diagnostics_modality_enum" NOT NULL, "patientId" uuid NOT NULL, CONSTRAINT "PK_2bb20db72fbfd9dc034f6ee7e55" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e1c0a789cbe0f06c64fe7e054b" ON "diagnostics" ("patientId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "idempotency_keys" ("idempotency_key" uuid NOT NULL, "request_hash" text, "entity_id" uuid, CONSTRAINT "PK_da5f36a3a43a07f0a91f2ab1662" PRIMARY KEY ("idempotency_key"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "diagnostics" ADD CONSTRAINT "FK_e1c0a789cbe0f06c64fe7e054b4" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "diagnostics" DROP CONSTRAINT "FK_e1c0a789cbe0f06c64fe7e054b4"`,
    );
    await queryRunner.query(`DROP TABLE "idempotency_keys"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e1c0a789cbe0f06c64fe7e054b"`);
    await queryRunner.query(`DROP TABLE "diagnostics"`);
    await queryRunner.query(`DROP TYPE "public"."diagnostics_modality_enum"`);
  }
}
