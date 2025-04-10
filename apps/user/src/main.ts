import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(UserModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 启用自动转换
      whitelist: true, // 移除 DTO 未定义的属性
    }),
  );

  await app.listen(3001);
}
void bootstrap();
