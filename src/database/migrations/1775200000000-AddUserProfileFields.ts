import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserProfileFields1775200000000 implements MigrationInterface {
  name = 'AddUserProfileFields1775200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "bannerUrl" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "address" text`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "highestEducation" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "highestEducation"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bannerUrl"`);
  }
}
