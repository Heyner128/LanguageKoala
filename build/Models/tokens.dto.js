import { Type } from '@sinclair/typebox';
import { Error } from '../Utils/types.util';
export const Token = Type.Object({
    id: Type.Optional(Type.Number()),
    token: Type.Optional(Type.String()),
    groupId: Type.String(),
    subscriptionDurationInDays: Type.Number(),
    redeemed: Type.Optional(Type.Boolean()),
});
export const CreateTokenSchema = {
    body: Token,
    response: {
        200: Token,
        500: Error,
    },
};
