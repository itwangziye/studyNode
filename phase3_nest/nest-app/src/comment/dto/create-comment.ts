import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateCommentDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(50, {message: "最多50字"})
    content!: string
}