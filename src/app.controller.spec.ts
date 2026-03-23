import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return health response', () => {
      const result = appController.getHealth();
      expect(result.ok).toBe(true);
      expect(result.name).toBe('lmp-backend');
      expect(typeof result.time).toBe('string');
    });
  });
});
