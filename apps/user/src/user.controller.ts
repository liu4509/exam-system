import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  LoginUserDto,
  RegisterUserDto,
  UpdateUserPasswordDto,
} from './user.dto';
import { EmailService } from '@app/email';
import { RedisService } from '@app/redis';
import { JwtService } from '@nestjs/jwt';
import { RequireLogin, UserInfo } from '@app/common';

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

  @Get('register-captcha')
  async captcha(
    @Query('address') address: string,
    @Query('ttl') ttl: number = 60,
  ) {
    await this.userService.sendUserMail({
      to: address,
      subject: '注册验证码',
      ttl,
      redisKey: 'captcha_' + address,
    });
    return '发送成功';
  }

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
        { expiresIn: '7d' }, // Token 过期时间是 7 天。
      ),
    };
  }

  @Get('update_password/captcha')
  @RequireLogin()
  async updatePasswordCaptcha(
    @Query('address') address: string,
    @Query('ttl') ttl: number = 60,
  ) {
    await this.userService.sendUserMail({
      to: address,
      subject: '更新密码验证码',
      ttl,
      redisKey: 'update_password_' + address,
    });
    return '发送成功';
  }

  @Post('update_password')
  @RequireLogin()
  async updatePassword(
    @UserInfo('userId') userId: number,
    @Body() passwordDto: UpdateUserPasswordDto,
  ) {
    await this.userService.updatePasswordById(userId, passwordDto);
    return '密码更新成功';
  }

  @Get('aaa')
  @RequireLogin()
  aaa(@UserInfo() userInfo, @UserInfo('username') username) {
    // return 'aaa';
    return {
      username,
      userInfo,
    };
  }
}
