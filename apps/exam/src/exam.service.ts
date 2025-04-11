import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ExamAddDto } from './exam.dto';
import { PrismaService } from '@app/prisma';

@Injectable()
export class ExamService {
  private logger = new Logger();

  @Inject(PrismaService)
  private prisma: PrismaService;

  async add(userId: number, dto: ExamAddDto) {
    try {
      return await this.prisma.exam.create({
        data: {
          name: dto.name,
          content: dto.content ? dto.content : '',
          createUser: {
            connect: {
              id: userId, // 关联userId
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(error, ExamService.name);
      throw new HttpException('添加失败', HttpStatus.BAD_REQUEST);
    }
  }
}
