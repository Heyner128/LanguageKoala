import { Static, Type } from '@sinclair/typebox';
import { Error } from '../Utils/types.util';

/**
 * The token TypeBox for request and reply validation
 */
export const Token = Type.Object({
  token: Type.Optional(Type.String()),
  groupId: Type.String(),
  subscriptionDurationInDays: Type.Number(),
  redeemed: Type.Optional(Type.Boolean()),
});

export type TokenType = Static<typeof Token>;

/**
 * The schema to pass to fastify for request and reply validation
 */
export const CreateTokenSchema = {
  body: Token,
  response: {
    200: Token,
    500: Error,
  },
};
