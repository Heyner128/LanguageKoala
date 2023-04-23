import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import TelegramBot, { Update } from 'node-telegram-bot-api';
import fastify, { FastifyReply, FastifyRequest } from 'fastify';
import { createLogger, format, transports } from 'winston';
import DBUtils from './Utils/database.util.js';
import { UserType } from './Models/users.dto.js';
import { SubscriptionType } from './Models/subscription.dto.js';
import { TokenType } from './Models/tokens.dto.js';
import { GroupType } from './Models/groups.dto.js';

const logTextFormat = format.printf(
  ({ level, message, timestamp, stack }) =>
    `${timestamp} ${level}: ${stack || message}`
);

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    logTextFormat
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), logTextFormat),
    }),
  ],
});

const database = {
  users: DBUtils.dataPoint<UserType>('users'),
  subscriptions: (userId: string) =>
    DBUtils.dataPoint<SubscriptionType>(`users/${userId}/subscriptions`),
  tokens: DBUtils.dataPoint<TokenType>('tokens'),
  groups: DBUtils.dataPoint<GroupType>('groups'),
};

const chatBot = new TelegramBot(process.env.BOT_TOKEN ?? '');

const httpServer = fastify().withTypeProvider<TypeBoxTypeProvider>();

if (process.env.NODE_ENV !== 'production') {
  // enables polling in development
  await chatBot.startPolling();
} else {
  // enables webhook in production
  if (!process.env.PUBLIC_URL) throw new Error('PUBLIC_URL is not defined!');
  await chatBot.setWebHook(
    `${process.env.PUBLIC_URL}/webhook${process.env.BOT_TOKEN}`
  );
  httpServer.post<{
    Body: Update;
  }>(
    `/webhook${process.env.BOT_TOKEN}`,
    async (request: FastifyRequest, reply: FastifyReply) => {
      chatBot.processUpdate(request.body as Update);
      reply.send(200);
    }
  );
}

export default { database, chatBot, httpServer, logger };
