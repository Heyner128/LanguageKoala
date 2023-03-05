import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import examples from './exampleData';
import Bot from './Bot';

dotenv.config();

// creates mock-up data
const prisma = new PrismaClient();

const createExampleData = () => {
  examples.forEach(async (user) => {
    try {
      await prisma.subscription.deleteMany();
      await prisma.user.deleteMany();
      await prisma.user.create({
        data: {
          telegramId: user.telegramId,
          documentId: user.documentId,
          email: user.email,
          name: user.name,
          subscriptions: { create: user.subscriptions },
        },
      });
      console.log(`Created user ${user.telegramId}`);
    } catch (error) {
      console.error(error);
    }
  });
};

createExampleData();

// eslint-disable-next-line no-new
new Bot();
