import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProviderToUser1776156238518 implements MigrationInterface {
  name = 'AddProviderToUser1776156238518';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "saved_jobs" DROP CONSTRAINT "FK_saved_jobs_job"`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_jobs" DROP CONSTRAINT "FK_saved_jobs_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "provider" character varying NOT NULL DEFAULT 'local'`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_jobs" ADD CONSTRAINT "FK_44c1881503861624985e9ad8b00" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_jobs" ADD CONSTRAINT "FK_af5c8a7f3e11e8e646ea0f81a04" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "saved_jobs" DROP CONSTRAINT "FK_af5c8a7f3e11e8e646ea0f81a04"`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_jobs" DROP CONSTRAINT "FK_44c1881503861624985e9ad8b00"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "provider"`);
    await queryRunner.query(
      `ALTER TABLE "saved_jobs" ADD CONSTRAINT "FK_saved_jobs_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_jobs" ADD CONSTRAINT "FK_saved_jobs_job" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
