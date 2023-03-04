import TelegramBot from "node-telegram-bot-api";
import { PrismaClient } from "@prisma/client";

class AccountBot {
  public bot: TelegramBot = new TelegramBot(process.env.BOT_TOKEN??'', { polling: true });
  private prisma = new PrismaClient();
  constructor() {
    this.bot.on('polling_error', (error) => {
      console.error(error);
      process.exit(1);
    });
  }
}

export class PremiumBot extends AccountBot {
    constructor() {
        super();
    }
}

class ManagementBot extends AccountBot {

}