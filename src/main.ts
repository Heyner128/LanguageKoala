import * as dotenv from 'dotenv';
import { Update } from 'node-telegram-bot-api';
import { FastifyReply, FastifyRequest } from 'fastify';
import GroupsRouter from './Routes/groups.route';
import UsersRouter from './Routes/users.route';
import TokensRouter from './Routes/tokens.route';
import Server from './server';

dotenv.config();

async function start() {
  GroupsRouter.init();
  UsersRouter.init();
  TokensRouter.init();
  Server.chatBot.on('polling_error', (error) => {
    Server.logger.error(
      new Error(`
      Telegram bot polling error: ${error.message}`)
    );
    process.exit(1);
  });
  try {
    const PORT = !Number.isNaN(Number(process.env.PORT))
      ? Number(process.env.PORT)
      : 3000;
    await Server.httpServer.listen({ port: PORT });
  } catch (error) {
    Server.logger.error(
      new Error(`
      Fastify start error: ${error instanceof Error ? error : 'UNDEFINED'}`)
    );
    process.exit(1);
  }

  Server.httpServer.post<{
    Body: Update;
  }>(
    `/webhook${process.env.BOT_TOKEN}`,
    async (request: FastifyRequest, reply: FastifyReply) => {
      Server.chatBot.processUpdate(request.body as Update);
      reply.send(200);
    }
  );
  Server.logger.info('App started successfully');
}

start();
