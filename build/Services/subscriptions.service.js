import Server from '../server';
async function createSubscription(userTelegramId, groupTelegramId, expiresAt) {
    try {
        return await Server.database.subscription.create({
            data: {
                user: {
                    connect: {
                        telegramId: userTelegramId,
                    },
                },
                group: {
                    connect: {
                        telegramId: groupTelegramId,
                    },
                },
                expiresAt,
            },
        });
    }
    catch (error) {
        console.error(error);
        throw new Error('Cannot create subscription, user or group not found');
    }
}
async function userHasActiveSubscription(userId, groupId) {
    try {
        const firstSubscription = await Server.database.subscription.findFirst({
            where: {
                userId,
                groupId,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });
        return firstSubscription !== null;
    }
    catch (error) {
        console.error(error);
        throw new Error('Cannot get subscription, user or group not found');
    }
}
async function getSubscriptionsByUserId(userId) {
    try {
        return await Server.database.subscription.findMany({
            where: {
                userId,
            },
        });
    }
    catch (error) {
        console.error(error);
        throw new Error('Cannot get subscriptions, user not found');
    }
}
export default {
    createSubscription,
    userHasActiveSubscription,
    getSubscriptionsByUserId,
};
