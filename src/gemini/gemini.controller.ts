import { Controller, Get, Post, Body } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Get('ping')
  ping() {
    return { ok: true, route: 'gemini/ping' };
  }

  @Post('ping')
  pingPost() {
    return { ok: true, route: 'gemini/ping' };
  }

  @Post('test')
  async test(@Body('prompt') prompt: string) {
    const response = await this.geminiService.prompt(
      prompt ?? 'Say hello in one sentence.',
    );
    return { response };
  }
}
