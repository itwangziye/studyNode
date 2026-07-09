// 注册接口的数据形状契约(对应你关 11 的 register 参数)
import { IsString, IsEmail, MinLength, MaxLength } from "class-validator"
export class RegisterDto {
  @IsString()
  @MaxLength(50)
  @MinLength(2)
  name!: string

  @IsEmail()
  email!: string

  @IsString()
  @MinLength(6)
  password!: string
}
