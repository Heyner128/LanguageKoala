import { Type } from '@sinclair/typebox';
import {
  ContextConfigDefault,
  FastifyReply,
  FastifyRequest,
  FastifySchema,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  RouteGenericInterface,
} from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

/**
 * TypeBox doesn't seem to provide an error type, so I'm creating one here
 */
export const Error = Type.Object({
  message: Type.String(),
});

/**
 * These types are used to provide typing on the fastify request controllers when they're imported from another file
 * normally, the type is inferred from the schema, but since I am importing from another file re-building the types it's necessary
 */
export type FastifyRequestTypebox<TSchema extends FastifySchema> =
  FastifyRequest<
    RouteGenericInterface,
    RawServerDefault,
    RawRequestDefaultExpression,
    TSchema,
    TypeBoxTypeProvider
  >;

/**
 * These types are used to provide typing on the fastify request controllers when they're imported from another file
 * normally, the type is inferred from the schema, but since I am importing from another file re-building the types it's necessary
 */
export type FastifyReplyTypebox<TSchema extends FastifySchema> = FastifyReply<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  RouteGenericInterface,
  ContextConfigDefault,
  TSchema,
  TypeBoxTypeProvider
>;

export interface ApiHeaders {
  'Api-Key': string;
}
