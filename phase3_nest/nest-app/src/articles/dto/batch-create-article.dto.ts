import { ApiProperty } from "@nestjs/swagger"
import { IsArray, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { CreateArticleDto } from "./create-article.dto"

export class BatchCreateArticleDto {
    @ApiProperty({ description: "文章数组" })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateArticleDto)    // 嵌套 DTO 校验需要这个
    articles!: CreateArticleDto[]
}