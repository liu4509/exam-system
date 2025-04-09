import { OmitType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty({
    message: '用户不能为空',
  })
  username: string;

  @IsNotEmpty({
    message: '密码不能为空',
  })
  @MinLength(6, { message: '密码不能少于6位' })
  password: string;

  @IsNotEmpty({
    message: '密码不能为空',
  })
  @IsEmail({}, { message: '不是合法邮箱' })
  email: string;

  @IsNotEmpty({
    message: '验证码不能为空',
  })
  captcha: string;
}

export class CreateUserDto extends OmitType(RegisterUserDto, [
  'captcha',
] as const) {}
