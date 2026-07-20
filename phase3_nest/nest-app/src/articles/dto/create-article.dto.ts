import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateArticleDto {
    @ApiProperty({description: "文章标题"})
    @IsString()
    @IsNotEmpty({message: "标题不能为空"})
    @MaxLength(200, {message: "标题最多200字"})
    @MinLength(1, {message: "标题最少1个字"})
    title!: string

    @ApiProperty({description: "文章内容"})
    @IsString()
    @IsNotEmpty({message: "内容不能为空"})
    content!: string
}