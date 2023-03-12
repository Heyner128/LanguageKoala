import { PrismaClient } from '@prisma/client';
import TelegramBot from 'node-telegram-bot-api';
import fastify from 'fastify';

const database = new PrismaClient();

const chatBot = new TelegramBot(process.env.BOT_TOKEN ?? '', {
  polling: true,
});

const httpServer = fastify({ logger: true });

export default { database, chatBot, httpServer };
