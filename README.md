## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## 项目快览

1. 服务的启动端口，分别改为 user 3001、exam 3002、answer 3003、analyse 3004
2. 启动所有服务 当服务名在当前没有时 会使用默认创建项目时的服务 当前默认是 3000 端口的

```cmd
npm run start:dev user
npm run start:dev exam
npm run start:dev answer
npm run start:dev analyse
```

3. 安装微服务的包

```cmd
npm install @nestjs/microservices --save
```

4. 微服务的之间的消息传递和触发 通过 microservice 库中的方法来实现

### 提供服务

5. 通过 @MessagePatter('sum') 来声明接口 sum 就是接口名
6. 在 main 中连接微服务 app.connectMicroservice 指定传输协议和暴露端口 并打开全部微服务 app.startAllMicroservice

### 消费者

7. 调用 ClientsModule.register 来声明服务key、其中传输协议、端口 要保持一致
8. 注入key 并声明类型为 ClientProxy，使用send方法来指定接口名sum，和传入参数

### 结束

9. 在 lib 中存放多个微服务需要使用的公共代码，如 redis 的配置及其公共方法
10. 安装ORM prisma 更改配置文件 .env 和 表结构 schema.prisma 以及 datasource

```cmd
  npm install prisma --save-dev
  // 执行 prisma init 创建 schema 文件
  npx prisma init
  // 重置下数据库
  npx prisma migrate reset
  // 创建新的 migration
  npx prisma migrate dev --name user
```

11. lib 中创建 prisma datasource 来配置数据库 并放回方法 操控数据
12. 在中使用了 生命周期钩子方法 模块初始化完成后 异步调用数据库连接方法 并配置log 将sql 语句打印在控制台
13. 引用 @nestjs/mapped-types 来处理创建 DTO 类频繁重复的问题
14. 加一下 ValidationPipe，来对请求体做校验

```cmd
  npm install --save class-validator class-transformer
```

15. 完成了用户注册
16. 封装个 email 的 lib 配置邮件地址 sendMail 发送邮件

```cmd
  npm install nodemailer --save
  npm i --save-dev @types/nodemailer
```

17. 完成 验证码发送 和 注册判断
18. 引入jwt 登录成功之后返回 token

```cmd
  npm install --save @nestjs/jwt
```

19. 加上 AuthGuard 来做登录鉴权, 使用 common 的 lib

```cmd
  nest g lib common
  // 生成 Guard
  nest g guard auth --flat --no-spec
```

20. 动态读取装饰器配置，实现灵活的权限控制，与 SetMetadata 和自定义装饰器配合使用
21. 全局启用这个 Guard，在 UserModule 里添加这个 provider
22. 把这个 @SetMetadata 封装成自定义装饰器，实现另一个自定义参数装饰器基于需要登录效验来取 request.user
23. 在访问接口之后，在 header 里额外返回新 token 实现自动续期
24. 将邮箱发送封装，与用户注册一样来实现更新密码接口

### 考试模块

25. 添加 npm scripts 简化 prisms 的命令
26. 创建考试表 schena 增加Exam 表 并迁移数据表

```cmd
  npm run db:dev:name exam
  // 执行结果: prisma migrate dev --name exam
```

27. 实现 exam 创建考试
28. 将 redis 的配置 抽离到 common 中注册 其他模块引入使用
29. 创建考试需要关联用户，所以需要登录，拿到用户信息在module中加全局的 AuthGuard
30. 在创建时需要关联 userId
31.
