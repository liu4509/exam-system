import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { MessagePattern } from '@nestjs/microservices';
import { RequireLogin, UserInfo } from '@app/common';
import { ExamAddDto, ExamSaveDto } from './exam.dto';

@Controller()
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post('add')
  @RequireLogin()
  async add(@UserInfo('userId') userId: number, @Body() dto: ExamAddDto) {
    return await this.examService.add(userId, dto);
  }

  @Get('list')
  @RequireLogin()
  async list(@UserInfo('userId') userId: number, @Query('bin') bin: string) {
    return await this.examService.list(userId, bin);
  }

  @Delete('delete/:id')
  @RequireLogin()
  async del(@Param('id') id: string, @UserInfo('userId') userId: number) {
    return await this.examService.delete(userId, +id);
  }

  @Post('save')
  @RequireLogin()
  async save(@Body() dto: ExamSaveDto, @UserInfo('userId') userId: number) {
    return await this.examService.save(dto, userId);
  }

  @Post('publish/:id')
  @RequireLogin()
  async publish(@UserInfo('userId') userId: number, @Param('id') id: string) {
    return await this.examService.publish(userId, +id);
  }

  @MessagePattern('sum')
  sum(numArr: Array<number>): number {
    return numArr.reduce((total, item) => total + item, 0);
  }
}
