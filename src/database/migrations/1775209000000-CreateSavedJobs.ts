import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSavedJobs1775209000000 implements MigrationInterface {
  name = 'CreateSavedJobs1775209000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "saved_jobs" ("user_id" uuid NOT NULL, "job_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7e2575d334b514767b5006cc5a3" PRIMARY KEY ("user_id", "job_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_jobs" ADD CONSTRAINT "FK_saved_jobs_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_jobs" ADD CONSTRAINT "FK_saved_jobs_job" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "saved_jobs" DROP CONSTRAINT "FK_saved_jobs_job"`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_jobs" DROP CONSTRAINT "FK_saved_jobs_user"`,
    );
    await queryRunner.query(`DROP TABLE "saved_jobs"`);
  }
}
