import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserFollows1776405000000 implements MigrationInterface {
  name = 'CreateUserFollows1776405000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "user_follows" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "followerId" uuid NOT NULL, "followingId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6ab7d9ae5d7b2c4bcdff0e6b3c6" PRIMARY KEY ("id"), CONSTRAINT "UQ_8c33844588a0a92fe190de64d8c" UNIQUE ("followerId", "followingId"))`,
    );
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_user_follows_follower') THEN
          ALTER TABLE "user_follows" ADD CONSTRAINT "FK_user_follows_follower" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_user_follows_following') THEN
          ALTER TABLE "user_follows" ADD CONSTRAINT "FK_user_follows_following" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_follows_followerId" ON "user_follows" ("followerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_follows_followingId" ON "user_follows" ("followingId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_user_follows_followingId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_user_follows_followerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_follows" DROP CONSTRAINT IF EXISTS "FK_user_follows_following"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_follows" DROP CONSTRAINT IF EXISTS "FK_user_follows_follower"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "user_follows"`);
  }
}
