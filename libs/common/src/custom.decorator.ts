import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtUserDate } from './auth.guard';

// 自定义装饰器
export const RequireLogin = () => SetMetadata('require-login', true);

// 需要登录效验 自定义参数装饰器 request.user
export const UserInfo = createParamDecorator(
  // TypeScript 泛型参数 K 表示 JwtUserData 接口的 任意一个属性名（如 "userId" 或 "username"）
  <K extends keyof JwtUserDate>(
    data: K | undefined,
    ctx: ExecutionContext,
  ): JwtUserDate | JwtUserDate[K] | undefined => {
    // 明确所有可能的返回类型
    const request = ctx.switchToHttp().getRequest<{ user?: JwtUserDate }>();
    if (!request.user) {
      throw new UnauthorizedException('用户信息缺失'); // 1. 检查用户数据是否存在
    }
    return data ? request.user[data] : request.user; // 2. 按需返回字段或完整对象
  },
);
