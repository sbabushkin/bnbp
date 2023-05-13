import {
  Args, Mutation, Resolver, Subscription,
} from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { PubSubEngine } from 'graphql-subscriptions/dist/pubsub-engine';
import { JwtAuthGuard, NoAuth } from '../auth/auth-jwt.guard';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { PermissionsGuard } from '../auth/permissions.guard';
import { CheckRecoveryHashInput, UpdatePasswordInput } from './dto/update-password.input';
import { UserEvents } from './events';
import { PUBSUB } from '../pubsub/pubsub.module';

@Resolver(() => User)
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    @Inject(PUBSUB) private pubSub: PubSubEngine,
  ) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  @Mutation(() => User)
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.userService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => User)
  removeUser(@Args('id') id: string) {
    return this.userService.remove(id);
  }

  @Mutation(() => Boolean, { nullable: true })
  @NoAuth()
  async sendRecoverPasswordEmail(
    @Args('email') email: string,
  ): Promise<void> {
    return this.userService.sendRecoverPasswordEmail(email);
  }

  @Mutation(() => Boolean)
  @NoAuth()
  async checkRecoveryHash(
    @Args('input') input: CheckRecoveryHashInput,
  ): Promise<boolean> {
    return this.userService.checkRecoveryHash(input);
  }

  @Mutation(() => User)
  @NoAuth()
  async updatePassword(
    @Args('input') input: UpdatePasswordInput,
  ): Promise<User> {
    return this.userService.updatePassword(input);
  }

  @Subscription(() => User, {
    resolve(value) {
      return value;
    },
  })
  @NoAuth()
  userLoggedIn() {
    return this.pubSub.asyncIterator(UserEvents.USER_LOGGED_IN);
  }

  @Subscription(() => User, {
    resolve(value) {
      return value;
    },
  })
  @NoAuth()
  userEmailHasChanged() {
    return this.pubSub.asyncIterator(UserEvents.USER_EMAIL_HAS_CHANGED);
  }
}
