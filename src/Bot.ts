import TelegramBot from 'node-telegram-bot-api';

export default class AccountBot {
  private bot: TelegramBot = new TelegramBot(process.env.BOT_TOKEN ?? '', {
    polling: true,
  });

  constructor() {
    this.bot.on('polling_error', (error) => {
      console.error(error);
      process.exit(1);
    });
    this.bot.onText(/\/start/, async (msg) => {
      await this.bot.sendMessage(msg.chat.id, 'Hello World!');
    });
    console.log('Bot started');
  }
}
