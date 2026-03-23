import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1773921084921 implements MigrationInterface {
  name = 'CreateUsers1773921084921';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying, "name" character varying NOT NULL, "avatarUrl" character varying, "designation" character varying, "organisation" character varying, "experience" character varying, "age" smallint, "gender" character varying, "dob" date, "linkedinUrl" character varying, "techStack" text array NOT NULL DEFAULT '{}', "streak" integer NOT NULL DEFAULT '0', "lastActive" date, "questionsPosted" integer NOT NULL DEFAULT '0', "totalVotes" integer NOT NULL DEFAULT '0', "googleId" character varying, "isVerified" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_f382af58ab36057334fb262efd5" UNIQUE ("googleId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
