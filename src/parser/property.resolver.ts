import {
  Args, Mutation, Resolver, Subscription,
} from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { PubSubEngine } from 'graphql-subscriptions/dist/pubsub-engine';
import { JwtAuthGuard, NoAuth } from '../auth/auth-jwt.guard';
import { ParserBaseService } from './parser.base.service';
import { Property } from './entities/property.entity';
import { UpdatePropertyInput } from './dto/update-property.input';
import { ParserService } from "./parser.service";

@Resolver(() => Property)
// @UseGuards(JwtAuthGuard, PermissionsGuard)
export class PropertyResolver {
  constructor(private readonly parserService: ParserService) {}

  @Mutation(() => Property)
  updateProperty(@Args('input') updatePropertyInput: UpdatePropertyInput) {
    return this.parserService.update(updatePropertyInput);
  }
}
