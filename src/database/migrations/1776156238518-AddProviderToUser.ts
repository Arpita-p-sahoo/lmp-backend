import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProviderToUser1776156238518 implements MigrationInterface {
  name = 'AddProviderToUser1776156238518';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "provider" character varying NOT NULL DEFAULT 'local'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "provider"`);
  }
}
