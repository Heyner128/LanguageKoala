import { Message, InlineKeyboardMarkup } from 'node-telegram-bot-api';

export type Command = {
  id: number;
  description: string;
  handler: (msg: Message) => Promise<Message | boolean>;
  resendCommands?: 'same' | 'back';
  adminCommand?: boolean;
  backCommand?: boolean;
};

/**
 * A reply markup is a button that is displayed below the message, here we create a reply markup for a command list
 *
 * @param commands - the list of commands
 * @param isAdmin - if the admin command should be displayed
 * @returns the reply markup
 */
function commandsReplyMarkup(
  commands: Command[],
  isAdmin: boolean
): InlineKeyboardMarkup {
  return {
    inline_keyboard: commands
      .filter((command) => (!isAdmin ? !command.adminCommand : true))
      .map((command) => [
        {
          text: command.description,
          callback_data: command.id.toString(),
        },
      ]),
  };
}

export default { commandsReplyMarkup };
