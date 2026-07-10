import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// createParamDecorator 接收一个函数:
//   data:   装饰器参数(如 @CurrentUser('userId') 的 'userId',本场景可不传)
//   ctx:    执行上下文,能拿 request
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();        // 填:拿 request
    return request.user;                              // 填:返回 user(不是整个 request!)
  },
);