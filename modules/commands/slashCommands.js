const client = require('../discordClient.js');

const SLASH_COMMANDS = [
  // Добавьте сюда имена всех слеш-команд, которые должны быть зарегистрированы на сервере
  'serverinfo',
];

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const commands = await client.application?.commands.fetch();
  if (commands) {
    const commandNames = commands.map(command => command.name);
    SLASH_COMMANDS.forEach(async (commandName) => {
      if (!commandNames.includes(commandName)) {
        await client.application?.commands.create({ name: commandName, type: 'CHAT_INPUT' });
        console.log(`Зарегистрирована слеш-команда "${commandName}"`);
      }
    });
  }

  if (commands) {
    commands.forEach(async (command) => {
      if (!SLASH_COMMANDS.includes(command.name)) {
        await command.delete();
        console.log(`Удалена неиспользуемая слеш-команда "${command.name}"`);
      }
    });
  }
});
