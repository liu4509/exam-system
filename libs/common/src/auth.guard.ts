import { JwtService } from '@nestjs/jwt';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';

export interface JwtUserDate {
  userId: number;
  username: string;
}
// 类型扩展，可以安全地访问 req.user 且获得类型提示
declare module 'express' {
  interface Request {
    user: JwtUserDate; // 在 Express 的 Request 对象上添加 user 属性
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  @Inject()
  private reflector: Reflector; // NestJS 的 Reflector 工具类，用于读取装饰器注入的元数据

  @Inject(JwtService)
  private jwtService: JwtService;

  private logger = new Logger();

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    // 动态读取装饰器配置，实现灵活的权限控制，与 SetMetadata 和自定义装饰器配合使用
    // 从类或方法上查找 require-login 元数据，优先方法级别 > 类级别
    const requireLogin = this.reflector.getAllAndOverride('require-login', [
      context.getClass(), // 当前控制器类
      context.getHandler(), // 当前请求处理方法
    ]);
    if (!requireLogin) {
      return true;
    }

    const authorization = request.headers.authorization;
    if (!authorization) {
      throw new UnauthorizedException('用户未登录');
    }
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('授权 Token 格式错误');
    }

    try {
      const token = authorization.split(' ')[1];
      const payload = this.jwtService.verify<JwtUserDate>(token);
      // 业务字段的显式检查 攻击者伪造了有效签名但缺少必要字段
      if (!payload.userId || !payload.username) {
        throw new UnauthorizedException('Token 内容无效');
      }

      // 安全解构 如果 Token 没有 userId 字段，不会报错，直接得到undefined
      const { userId, username } = payload;
      request.user = {
        userId,
        username,
      };

      // 只要访问需要登录的接口，就会刷新 token
      response.header(
        'token',
        this.jwtService.sign(
          {
            userId,
            username,
          },
          {
            expiresIn: '7d',
          },
        ),
      );

      return true;
    } catch (error) {
      this.logger.error(
        `JWT验证失败: ${error.message}`,
        error.stack,
        AuthGuard.name,
      );
      throw new UnauthorizedException('Token 失效，请重新登录');
    }
  }
}
