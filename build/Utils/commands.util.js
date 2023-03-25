function commandsReplyMarkup(commands) {
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
