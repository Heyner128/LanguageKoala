import TelegramBot from 'node-telegram-bot-api';
import UsersService from '../Services/users.service';
import HelperFunctions from '../Utils/helperFunctions.util';
import Server from '../server';

function newMembers(msg: TelegramBot.Message) {
  if (msg && msg.new_chat_members) {
    msg.new_chat_members.forEach(async (newMember) => {
      const user = await UsersService.getUserById(newMember.id);
      const hasSubscription = await UsersService.userHasActiveSubscription(
        newMember.id,
        msg.chat.id
      );

      if (user && hasSubscription) {
        await Server.chatBot.sendMessage(
          msg.chat.id,
          `Bienvenido ${user.name}!`
        );
      } else if (!user) {
        await Server.chatBot.banChatMember(msg.chat.id, String(newMember.id));
        await Server.chatBot.sendMessage(
          msg.chat.id,
          `Welcome ${newMember.first_name} benned! Reason: Not a premium user.`
        );
      } else if (!hasSubscription) {
        await Server.chatBot.sendMessage(
          msg.chat.id,
          `Welcome ${user.name} please confirm your subscription by pressing on the button`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: 'Confirm Subscription',
                    url: `https://t.me/${process.env.BOT_USERNAME}?start=${user.documentId}`,
                  },
                ],
              ],
            },
          }
        );
        await HelperFunctions.delay(2 * 60 * 1000);
        if (
          await UsersService.userHasActiveSubscription(
            newMember.id,
            msg.chat.id
          )
        )
          return;
        await Server.chatBot.banChatMember(msg.chat.id, String(newMember.id));
        await Server.chatBot.sendMessage(
          msg.chat.id,
          `${newMember.first_name} Banned! Reason: Doesn't have an active subscription.`
        );
      }
    });
  }
}

async function leftMember(msg: TelegramBot.Message) {
  if (msg && msg.left_chat_member) {
    await Server.chatBot.unbanChatMember(
      msg.chat.id,
      String(msg.left_chat_member.id)
    );
  }
}

export default { newMembers, leftMember };
