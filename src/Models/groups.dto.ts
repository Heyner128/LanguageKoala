import { Static, Type } from '@sinclair/typebox';
import { Error } from '../Utils/types.util';

/**
 * The groups TypeBox for request and reply validation
 */
export const Groups = Type.Array(
  Type.Object({
    id: Type.Number(),
    telegramId: Type.String(),
    name: Type.String(),
  })
);

export type GroupsType = Static<typeof Groups>;

/**
 * The schema to pass to fastify for request and reply validation
 */
export const GetGroupsSchema = {
  response: {
    200: Groups,
    500: Error,
  },
};
