import Server from '../server';
async function createToken(token, groupId, subscriptionDurationInDays) {
    try {
        return await Server.database.token.create({
            data: {
                token,
                group: {
                    connect: {
                        telegramId: groupId,
                    },
                },
                subscriptionDurationInDays,
            },
        });
    }
    catch (error) {
        Server.logger.error('Token creation database error', error);
        throw new Error('Cannot create token, group not found');
    }
}
async function redeemToken(token) {
    try {
        return await Server.database.token.update({
            where: {
                token,
            },
            data: {
                redeemed: true,
            },
        });
    }
    catch (error) {
        Server.logger.error('Token redemption database error', error);
        throw new Error('Cannot redeem token, not found');
    }
}
export default { createToken, redeemToken };
