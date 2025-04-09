import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      log: [
        {
          level: 'query',
          emit: 'stdout',
        },
      ],
    });
  }
  // 生命周期钩子方法 模块初始化完成后被调用
  async onModuleInit() {
    await this.$connect();
  }
}
