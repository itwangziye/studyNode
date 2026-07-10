import { SetMetadata } from '@nestjs/common';

// 这个 key 是存取元数据的暗号,装饰器和 Guard 用同一个 key 才能对上
export const ROLES_KEY = 'roles';

// SetMetadata 是 NestJS 提供的工具,把数据存到接口元数据里
// ...roles 收集所有参数:@Roles("admin") → roles = ["admin"]
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);