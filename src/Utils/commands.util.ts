import { Message, InlineKeyboardMarkup } from 'node-telegram-bot-api';

export type Command = {
  description: string;
  handler: (msg: Message) => Promise<Message>;
  resendCommands: boolean;
};

function commandsReplyMarkup(commands: Command[]): InlineKeyboardMarkup {
  return {
    inline_keyboard: commands.map((command, index) => [
      {
        text: command.description,
        callback_data: index.toString(),
      },
    ]),
  };
}

export default { commandsReplyMarkup };
