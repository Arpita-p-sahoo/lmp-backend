import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateJobs1774526052033 implements MigrationInterface {
  name = 'CreateJobs1774526052033';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "company" character varying NOT NULL, "location" character varying, "type" character varying(10), "experience" character varying, "salary" character varying, "techStack" text array NOT NULL DEFAULT '{}', "description" text, "posted_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD CONSTRAINT "FK_eec67b5cfec9db98bf94612a5f7" FOREIGN KEY ("posted_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "jobs" DROP CONSTRAINT "FK_eec67b5cfec9db98bf94612a5f7"`,
    );
    await queryRunner.query(`DROP TABLE "jobs"`);
  }
}
