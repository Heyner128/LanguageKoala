import TelegramBot from 'node-telegram-bot-api';
import UsersService from '../Services/users.service';
import SubscriptionsService from '../Services/subscriptions.service';
import GroupsService from '../Services/groups.service';
import {
  FastifyReplyTypebox,
  FastifyRequestTypebox,
} from '../Utils/types.util';
import HelperFunctions from '../Utils/helperFunctions.util';
import Server from '../server';
import { GetGroupsSchema } from '../Models/groups.dto';

async function getGroups(
  request: FastifyRequestTypebox<typeof GetGroupsSchema>,
  reply: FastifyReplyTypebox<typeof GetGroupsSchema>
) {
  try {
    const groups = await Server.database.group.findMany().then((grs) =>
      grs.map((gr) => ({
        id: gr.id,
        telegramId: String(gr.telegramId),
        name: gr.name,
      }))
    );
    reply.status(200).send(groups);
  } catch (error) {
    Server.logger.error('Error getting groups: ', error);
    reply.status(500).send({
      message: `Cannot get groups, Error: ${
        error instanceof Error ? error?.message : String(error)
      }`,
    });
  }
}

async function botMembershipUpdate(
  chatMemberUpdate: TelegramBot.ChatMemberUpdated
) {
  const newStatus = chatMemberUpdate.new_chat_member.status;
  try {
    if (newStatus === 'administrator') {
      await GroupsService.createGroup(
        BigInt(chatMemberUpdate.chat.id),
        chatMemberUpdate.chat.title ?? 'NO_NAME'
      );

      Server.logger.info(`Group ${chatMemberUpdate.chat.id} created`);
    } else if (newStatus === 'left') {
      await GroupsService.deleteGroup(BigInt(chatMemberUpdate.chat.id));
      Server.logger.info(`Group ${chatMemberUpdate.chat.id} deleted`);
    }
  } catch (error) {
    Server.logger.error('Error updating groups: ', error);
  }
}

function newMembers(msg: TelegramBot.Message) {
  if (
    msg &&
    msg.new_chat_members &&
    !msg.new_chat_members.some(
      (member) => member.username === process.env.BOT_USERNAME
    )
  ) {
    msg.new_chat_members.forEach(async (newMember) => {
      try {
        const user = await UsersService.getUserById(newMember.id);
        const hasSubscription =
          await SubscriptionsService.userHasActiveSubscription(
            BigInt(newMember.id),
            BigInt(msg.chat.id)
          );

        if (user && hasSubscription) {
          await Server.chatBot.sendMessage(
            msg.chat.id,
            `Bienvenido ${user.name}!`
          );

          Server.logger.info(`User ${user.name} joined group ${msg.chat.id}`);
        } else if (!user) {
          await Server.chatBot.banChatMember(msg.chat.id, String(newMember.id));
          await Server.chatBot.sendMessage(
            msg.chat.id,
            `${newMember.first_name} baneado! Razon: No esta registrado en el sistema.`
          );

          Server.logger.info(
            `User ${newMember.first_name} banned from group ${msg.chat.id}`
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

          Server.logger.info(
            `User subscription request sent to ${user.name} in group ${msg.chat.id}`
          );
          await HelperFunctions.delay(2 * 60 * 1000);
          if (
            await SubscriptionsService.userHasActiveSubscription(
              BigInt(newMember.id),
              BigInt(msg.chat.id)
            )
          ) {
            Server.logger.info(
              `The user ${user.name} has a valid subscription to group ${msg.chat.id}`
            );
            return;
          }

          await Server.chatBot.banChatMember(msg.chat.id, String(newMember.id));
          await Server.chatBot.sendMessage(
            msg.chat.id,
            `${newMember.first_name} Baneado! Razon: No tiene una suscripcion activa.`
          );
          Server.logger.info(
            `The user ${user.name} has been banned from group ${msg.chat.id} for not having a valid subscription`
          );
        }
      } catch (error) {
        Server.logger.error('Error on-boarding new member: ', error);
      }
    });
  }
}

async function leftMember(msg: TelegramBot.Message) {
  if (
    msg &&
    msg.left_chat_member &&
    msg.left_chat_member.username !== process.env.BOT_USERNAME
  ) {
    try {
      Server.logger.info(
        `User ${msg.left_chat_member.id} left group ${msg.chat.id}`
      );
      await Server.chatBot.unbanChatMember(
        msg.chat.id,
        String(msg.left_chat_member.id)
      );
      Server.logger.info(
        `User ${msg.left_chat_member.id} unbanned from group ${msg.chat.id}`
      );
    } catch (error) {
      Server.logger.error('Error executing left member flow: ', error);
    }
  }
}

export default { getGroups, newMembers, leftMember, botMembershipUpdate };
