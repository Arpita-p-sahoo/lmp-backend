import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealth(): { ok: true; name: string; time: string } {
    return this.appService.getHealth();
  }

  @Get('questions')
  getQuestions(): unknown {
    return this.appService.getQuestions();
  }
}
