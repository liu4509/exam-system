import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RedisModule } from '@app/redis';
import { PrismaModule } from '@app/prisma';
import { EmailModule } from '@app/email';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    RedisModule,
    PrismaModule,
    EmailModule,
    JwtModule.registerAsync({
      global: true,
      useFactory() {
        return {
          secret: 'liu4509',
          signOptions: {
            expiresIn: '30m',
          },
        };
      },
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
