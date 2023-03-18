import TelegramBot from 'node-telegram-bot-api';
import UsersService from '../Services/users.service';
import SubscriptionsService from '../Services/subscriptions.service';
import HelperFunctions from '../Utils/helperFunctions.util';
import Server from '../server';

function newMembers(msg: TelegramBot.Message) {
  if (msg && msg.new_chat_members) {
    msg.new_chat_members.forEach(async (newMember) => {
      const user = await UsersService.getUserById(newMember.id);
      const hasSubscription =
        await SubscriptionsService.userHasActiveSubscription(
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
          `${newMember.first_name} baneado! Razon: No esta registrado en el sistema.`
        );
      } else if (!hasSubscription) {
        await Server.chatBot.sendMessage(
          msg.chat.id,
          `Bienvenido ${user.name} por favor valida tu suscripción presionando el botón`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: 'Validar suscripción',
                    url: `https://t.me/${process.env.BOT_USERNAME}?start=${user.documentId}`,
                  },
                ],
              ],
            },
          }
        );
        await HelperFunctions.delay(2 * 60 * 1000);
        if (
          await SubscriptionsService.userHasActiveSubscription(
            newMember.id,
            msg.chat.id
          )
        )
          return;
        await Server.chatBot.banChatMember(msg.chat.id, String(newMember.id));
        await Server.chatBot.sendMessage(
          msg.chat.id,
          `${newMember.first_name} Baneado! Razon: No tiene una suscripcion activa.`
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
