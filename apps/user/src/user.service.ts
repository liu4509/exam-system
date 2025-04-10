import { PrismaService } from '@app/prisma';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { md5 } from './utils';
import { RedisService } from '@app/redis';
import { RegisterUserDto, LoginUserDto } from './user.dto';

@Injectable()
export class UserService {
  private logger = new Logger();

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(PrismaService)
  private prisma: PrismaService;

  async create(user: RegisterUserDto) {
    // 1. 查询 redis 中的验证码 判断失效和存在
    const captcha = await this.redisService.get(`captcha_${user.email}`);
    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }
    if (user.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }
    await this.redisService.del(`captcha_${user.email}`); // 使用后就清除 防止

    // 2. 判断用户是否存在
    const foundUser = await this.prisma.user.findUnique({
      where: {
        username: user.username,
      },
    });
    if (foundUser) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }

    // 3. 存入数据库
    try {
      return await this.prisma.user.create({
        data: {
          username: user.username,
          password: md5(user.password),
          email: user.email,
        },
        select: {
          id: true,
          username: true,
          email: true,
          createTime: true,
        },
      });
    } catch (error) {
      this.logger.error(error, UserService.name);
      return null;
    }
  }

  async findOne(loginUserDto: LoginUserDto) {
    // 1. 查询用户
    const foundUser = await this.prisma.user.findUnique({
      where: {
        username: loginUserDto.username,
      },
    });

    if (!foundUser) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    // 2. 判断密码
    const { password, ...user } = foundUser;
    if (md5(loginUserDto.password) !== password) {
      throw new HttpException('用户账号或密码不正确', HttpStatus.BAD_REQUEST);
    }

    return user;
  }
}
