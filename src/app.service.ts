import { Get, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  @Get('health')
  health() {
  return { status: 'ok' };
}

}
