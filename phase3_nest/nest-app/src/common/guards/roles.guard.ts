import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  // Reflector 是 NestJS 用来读元数据的工具,通过 IoC 注入
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // ① 读接口上 @Roles("admin") 声明的角色
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [   // 填:用什么 key?
      context.getHandler(),    // 当前方法(delete)
      context.getClass(),      // 当前类(TaskController)
    ]);

    // ② 如果没贴 @Roles 装饰器 → 说明不需要角色控制,直接放行
    if (!requiredRoles) {
      return true;   // 填:true/false?
    }

    // ③ 拿当前登录用户的角色
    //    JwtAuthGuard 验证成功后,把 {userId, email} 挂到了 req.user
    //    但角色需要查数据库!这里先简化:假设 req.user 已带 role
    const request = context.switchToHttp().getRequest();
    const userRole = request.user?.role;   // 填:用户的角色从哪取?

    // ④ 比对:用户的角色是否在要求的角色列表里
    const hasRole = requiredRoles.some((role) => userRole === role);   // 填:userRole 还是别的?

    if (!hasRole) {
      throw new ForbiddenException('权限不足');   // 403,不是 401!
    }
    return true;
  }
}