import { Body, Controller, Get, Inject } from '@nestjs/common';
import { ExamService } from './exam.service';
import { MessagePattern } from '@nestjs/microservices';
import { RedisService } from '@app/redis';
import { RequireLogin, UserInfo } from '@app/common';
import { ExamAddDto } from './exam.dto';

@Controller()
export class ExamController {
  constructor(private readonly examService: ExamService) {}
  @Inject(RedisService)
  private redisService: RedisService;

  @Get('add')
  @RequireLogin()
  async add(@UserInfo('userId') userId: number, @Body() dto: ExamAddDto) {
    return await this.examService.add(userId, dto);
  }

  @MessagePattern('sum')
  sum(numArr: Array<number>): number {
    return numArr.reduce((total, item) => total + item, 0);
  }
}
