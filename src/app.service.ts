import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { ok: true; name: string; time: string } {
    return { ok: true, name: 'lmp-backend', time: new Date().toISOString() };
  }
}
