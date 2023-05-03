import { Message, InlineKeyboardMarkup } from 'node-telegram-bot-api';

export type Command = {
  description: string;
  handler: (msg: Message) => Promise<Message | boolean>;
  resendCommands?: 'same' | 'back';
};

/**
 * A reply markup is a button that is displayed below the message, here we create a reply markup for a command list
 *
 * @param commands - the list of commands
 * @returns the reply markup
 */
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
