import { Injectable, ConflictException, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import bcrypt from "bcryptjs"
import { PrismaService } from "../prisma/prisma.service"

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // 注册——你关 11 register 的翻版
  async register(name: string, email: string, password: string) {
    // ① 查 email 是否已存在
    const existing = await this.prisma.user.findUnique({ where: { email } })
    if (existing) throw new ConflictException("邮箱已被注册")
    const hash = await bcrypt.hash(password, 10)
    return await this.prisma.user.create({data: 
        {name, email, password: hash}, 
        select: {
            name: true,
            email: true,
            id: true
        }})
  }

  // 登录——你关 11 login 的翻版
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })

    if (!user) throw new UnauthorizedException("邮箱或密码错误")
    const match = await bcrypt.compare(password, user.password)

    if (!match) throw new UnauthorizedException("邮箱或密码错误")
    const token = await this.jwtService.signAsync({userId: user.id, email: user.email})

    return {
        token
    }
  }
}