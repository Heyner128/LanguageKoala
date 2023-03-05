import dayjs from 'dayjs';
import { User } from './types';

export default [
  {
    telegramId: 'hacg12',
    documentId: 20722045,
    email: 'heyner128@gmail.com',
    name: 'Heyner',
    subscriptions: [
      {
        expiresAt: dayjs().add(1, 'month').toDate(),
        groupId: 'French',
      },
    ],
  },
] as User[];
