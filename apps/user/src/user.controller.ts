import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginUserDto, RegisterUserDto } from './user.dto';
import { EmailService } from '@app/email';
import { RedisService } from '@app/redis';
import { JwtService } from '@nestjs/jwt';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}
  private logger = new Logger();

  @Inject(EmailService)
  emailServier: EmailService;

  @Inject(RedisService)
  redisService: RedisService;

  @Inject(JwtService)
  jwtService: JwtService;

  @Post('register')
  async register(@Body() register: RegisterUserDto) {
    return await this.userService.create(register);
  }

  @Post('login')
  async userLogin(@Body() loginUserDto: LoginUserDto) {
    const user = await this.userService.findOne(loginUserDto);
    return {
      user,
      token: this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
        },
        { expiresIn: '7d' }, // token 过期时间是 7 天。
      ),
    };
  }

  @Get('register-captcha')
  async captcha(
    @Query('address') address: string,
    @Query('ttl') ttl: number = 60,
  ) {
    const code = Math.random().toString().slice(2, 8);
    try {
      await this.emailServier.sendMail({
        to: address,
        subject: '注册验证码',
        html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4A90E2;">你好！👋</h2>
          <p style="font-size: 16px;">感谢你使用考试系统！以下是你的注册验证码：</p>
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
    } catch (error) {
      this.logger.error(error, UserController.name);
      throw new HttpException('验证码发送失败', HttpStatus.BAD_REQUEST);
    }

    console.log(address + '-验证码-' + code);
    await this.redisService.set(`captcha_${address}`, code, ttl);
    return '发送成功';
  }
}
