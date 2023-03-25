import * as dotenv from 'dotenv';
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
    Server.logger.error('Telegram bot connection error:', error);
    process.exit(1);
  });
  try {
    const PORT = !Number.isNaN(Number(process.env.PORT))
      ? Number(process.env.PORT)
      : 3000;
    await Server.httpServer.listen({ port: PORT });
  } catch (error) {
    Server.logger.error('Fastify server start error:', error);
    process.exit(1);
  }
  Server.logger.info('App started successfully');
}

start();
