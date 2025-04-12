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

  async list(userId: number, bin: string) {
    return await this.prisma.exam.findMany({
      // 有bin查询回收站 反之返回正常的列表
      where:
        bin !== undefined
          ? {
              createUserId: userId,
              isDelete: true,
            }
          : {
              createUserId: userId,
              isDelete: false,
            },
    });
  }

  // 软删除
  async delete(userid: number, id: number) {
    return await this.prisma.exam.update({
      where: {
        id,
        createUserId: userid,
      },
      data: {
        isDelete: true,
      },
    });
  }
}
