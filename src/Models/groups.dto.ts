import { Static, Type } from '@sinclair/typebox';
import { Error } from '../Utils/types.util';

export const Groups = Type.Array(
  Type.Object({
    id: Type.Number(),
    telegramId: Type.String(),
    name: Type.String(),
  })
);

export type GroupsType = Static<typeof Groups>;

export const GetGroupsSchema = {
  response: {
    200: Groups,
    500: Error,
  },
};
