import dayjs from 'dayjs';

export const exampleUsers = [
  {
    telegramId: 123456,
    documentId: 20722045,
    email: 'heyner128@gmail.com',
    name: 'Heyner',
    subscriptions: [
      {
        expiresAt: dayjs().add(1, 'month').toDate(),
        groupId: 123456,
      },
    ],
  },
];

export const exampleGroups = [
  {
    telegramId: 123456,
    name: 'Grupo de prueba',
  },
];

export const exampleSubscriptions = exampleUsers.flatMap((user) =>
  user.subscriptions.map((subscription) => ({
    userId: user.telegramId,
    groupId: subscription.groupId,
    expiresAt: subscription.expiresAt,
  }))
);
