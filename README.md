
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
10. 
