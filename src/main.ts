import * as dotenv from 'dotenv';
import GroupsRouter from './Routes/groups.route.js';
import UsersRouter from './Routes/users.route.js';
import TokensRouter from './Routes/tokens.route.js';
import Server from './server.js';

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

  Server.chatBot.on('webhook_error', (error) => {
    Server.logger.error(
      new Error(`
      Telegram bot webhook error: ${error.message}`)
    );
    process.exit(1);
  });

  try {
    const IS_GOOGLE_CLOUD_RUN = process.env.K_SERVICE !== undefined;

    const port = !Number.isNaN(Number(process.env.PORT))
      ? Number(process.env.PORT)
      : 3000;

    const host = IS_GOOGLE_CLOUD_RUN ? '0.0.0.0' : undefined;

    await Server.httpServer.listen({ port, host });
  } catch (error) {
    Server.logger.error(
      new Error(`
      Fastify start error: ${error instanceof Error ? error : 'UNDEFINED'}`)
    );
    process.exit(1);
  }

  Server.logger.info('App started successfully');
}

await start();
