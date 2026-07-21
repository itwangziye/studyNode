import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { CommentService } from './comment.service';
import { ApiBearerAuth, ApiTags, ApiOperation} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CreateCommentDto } from "./dto/create-comment";

@ApiTags("评论")
@ApiBearerAuth()
@Controller()
export class CommentController {
    constructor(private readonly commentsService: CommentService) {}

    @Get("articles/:articleId/comments")
    @ApiOperation({summary: "获取所有评论"})
    async findAll(@Param("articleId", ParseIntPipe) articleId: number) {
        return this.commentsService.findByArticleId(articleId)
    }

    @Post("articles/:articleId/comments")
    @ApiOperation({summary: "创建评论"})
    @UseGuards(JwtAuthGuard)
    async create(
        @Param("articleId", ParseIntPipe) articleId: number, 
        @Body() dto: CreateCommentDto, 
        @CurrentUser() user
    ) {
        return await this.commentsService.create(dto, articleId, user.userId)
    }

    @Delete("articles/comments/:id")
    @ApiOperation({summary: "删除评论"})
    @UseGuards(JwtAuthGuard)
    async remove(
        @Param("id", ParseIntPipe) id: number,
        @CurrentUser() user,
    ) {
        return await this.commentsService.remove(id, user.userId, user.role)
    }

}