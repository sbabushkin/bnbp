import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { JwtAuthGuard } from '../auth/auth-jwt.guard';

@Resolver(() => Comment)
@UseGuards(JwtAuthGuard)
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  @Mutation(() => Comment)
  createComment(@Args('createCommentInput') createCommentInput: CreateCommentInput) {
    return this.commentService.createOuter(createCommentInput);
  }

  @Mutation(() => Comment)
  updateComment(@Args('updateCommentInput') updateCommentInput: UpdateCommentInput) {
    return this.commentService.update(updateCommentInput.id, updateCommentInput);
  }

  @Mutation(() => Comment)
  removeComment(@Args('id') id: string) {
    return this.commentService.remove(id);
  }
}
