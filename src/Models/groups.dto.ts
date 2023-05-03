import { Static, Type } from '@sinclair/typebox';
import { Error } from '../Utils/types.util.js';

/**
 * The groups TypeBox for request and reply validation
 */
export const Group = Type.Object({
  groupId: Type.String(),
  name: Type.String(),
});

export type GroupType = Static<typeof Group>;

/**
 * The schema to pass to fastify for request and reply validation
 */
export const GetGroupsSchema = {
  response: {
    200: Type.Array(Group) || Group,
    500: Error,
  },
};
