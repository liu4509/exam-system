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
import {
  RegisterUserDto,
  LoginUserDto,
  UpdateUserPasswordDto,
} from './user.dto';
import { EmailService } from '@app/email';

@Injectable()
export class UserService {
  private logger = new Logger();

  @Inject(EmailService)
  emailServier: EmailService;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(PrismaService)
  private prisma: PrismaService;

  async create(user: RegisterUserDto) {
    // 1. 查询 redis 中的验证码 判断失效和存在
    const captcha = await this.redisService.get(`captcha${user.email}`);
    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }
    if (user.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }

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
      throw new HttpException('注册失败', HttpStatus.BAD_REQUEST);
    } finally {
      await this.redisService.del(`captcha${user.email}`); // 使用后就清除 防止
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

  async sendUserMail({
    to,
    subject,
    ttl,
    redisKey,
  }: {
    to: string;
    subject: string;
    ttl: number;
    redisKey: string;
  }) {
    if (!to) {
      throw new HttpException('邮箱不能为空', HttpStatus.BAD_REQUEST);
    }

    try {
      const code = Math.random().toString().slice(2, 8);
      await this.emailServier.sendMail({
        to,
        subject,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4A90E2;">你好！👋</h2>
              <p style="font-size: 16px;">感谢你使用考试系统！以下是你的${subject}：</p>
              <div style="background: #F5F5F5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="font-size: 24px; font-weight: bold; color: #4A90E2; margin: 0;">${code}</p>
              </div>
              <button 
                style="background: #4A90E2; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;"
                onclick="navigator.clipboard.writeText('${code}').then(() => alert('验证码已复制！'))"
              >
                点击复制验证码
              </button>
              <p style="font-size: 14px; color: #666; margin-top: 20px;">温馨提示：此验证码将在 ${ttl < 60 ? `${ttl} 秒` : `${Math.floor(ttl / 60)} 分钟`}后失效，请尽快使用。</p>
              <p style="font-size: 14px; color: #666;">如果你未进行此操作，请忽略此邮件。</p>
            </div>
            `,
      });

      console.log(to + '-验证码-' + code);
      await this.redisService.set(redisKey, code, ttl);
    } catch (error) {
      this.logger.error(error, UserService.name);
      throw new HttpException('验证码发送失败', HttpStatus.BAD_REQUEST);
    }
  }

  async updatePasswordById(userId: number, passwordDto: UpdateUserPasswordDto) {
    // 1. 查询 redis 中的验证码 判断失效和存在
    const captcha = await this.redisService.get(
      `update_password_${passwordDto.email}`,
    );
    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }
    if (passwordDto.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }

    // 2. 判断用户是否存在
    const foundUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!foundUser) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    if (md5(passwordDto.oldPassword) !== foundUser.password) {
      throw new HttpException('旧密码不正确', HttpStatus.BAD_REQUEST);
    }
    foundUser.password = md5(passwordDto.password);

    // 3. 存入数据库
    try {
      return await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: foundUser,
      });
    } catch (error) {
      this.logger.error(error, UserService.name);
      throw new HttpException('更新密码时数据库错误', HttpStatus.BAD_REQUEST);
    } finally {
      await this.redisService.del(`update_password_${passwordDto.email}`); // 使用后就清除 防止
    }
  }
}
