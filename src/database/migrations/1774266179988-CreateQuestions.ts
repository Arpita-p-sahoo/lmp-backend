import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuestions1774266179988 implements MigrationInterface {
  name = 'CreateQuestions1774266179988';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" text NOT NULL, "tech_tag" character varying NOT NULL, "hashtags" text array NOT NULL DEFAULT '{}', "author_id" uuid NOT NULL, "vote_count" integer NOT NULL DEFAULT '0', "comment_count" integer NOT NULL DEFAULT '0', "is_hot" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "votes" ("user_id" uuid NOT NULL, "question_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7dba3014097831ff4f063cf8ced" PRIMARY KEY ("user_id", "question_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "saved_questions" ("user_id" uuid NOT NULL, "question_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bdb7342acbdce9338fb86ae06dd" PRIMARY KEY ("user_id", "question_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ADD CONSTRAINT "FK_dcaac7adf4b5af7bc980ec5250e" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "votes" ADD CONSTRAINT "FK_27be2cab62274f6876ad6a31641" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "votes" ADD CONSTRAINT "FK_64d599e35a82d2f4396e5380811" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_questions" ADD CONSTRAINT "FK_87914a45035b500d15395932d6e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_questions" ADD CONSTRAINT "FK_7683c2483abc9013eb029a79c2a" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "saved_questions" DROP CONSTRAINT "FK_7683c2483abc9013eb029a79c2a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_questions" DROP CONSTRAINT "FK_87914a45035b500d15395932d6e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "votes" DROP CONSTRAINT "FK_64d599e35a82d2f4396e5380811"`,
    );
    await queryRunner.query(
      `ALTER TABLE "votes" DROP CONSTRAINT "FK_27be2cab62274f6876ad6a31641"`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" DROP CONSTRAINT "FK_dcaac7adf4b5af7bc980ec5250e"`,
    );
    await queryRunner.query(`DROP TABLE "saved_questions"`);
    await queryRunner.query(`DROP TABLE "votes"`);
    await queryRunner.query(`DROP TABLE "questions"`);
  }
}
