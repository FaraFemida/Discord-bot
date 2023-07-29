const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { format } = require('date-fns');
const { ru } = require('date-fns/locale');
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

const SLASH_COMMANDS = [
  // Добавьте сюда имена всех слеш-команд, которые должны быть зарегистрированы на сервере
  'serverinfo',
];

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

   // Зарегистрируем слеш-команды при каждом запуске бота
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

    // Удалим неиспользуемые слеш-команды, которых нет в массиве SLASH_COMMANDS
  if (commands) {
    commands.forEach(async (command) => {
      if (!SLASH_COMMANDS.includes(command.name)) {
        await command.delete();
        console.log(`Удалена неиспользуемая слеш-команда "${command.name}"`);
      }
    });
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'serverinfo') {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply('Команда доступна только на сервере!');
      return;
    }

    const memberCount = guild.memberCount;
    const activeMembers = guild.members.cache.filter((member) => member.presence?.status !== 'offline').size;
    const voiceChannels = guild.channels.cache.filter((channel) => channel.type === 'GUILD_VOICE'); // Добавлено: Получаем список голосовых каналов сервера
    const voiceChannelMembers = voiceChannels.reduce((totalMembers, voiceChannel) => totalMembers + voiceChannel.members.size, 0); // Добавлено: Считаем количество участников в голосовых каналах
    const createdAt = guild.createdAt;
    const formattedDate = format(createdAt, 'PPP', { locale: ru }); // Форматируем дату в виде 'день месяц год' (например, '28 июля 2023')

       // Проверяем, доступен ли объект "guild.owner", иначе пытаемся получить информацию из кэша гильдии
       const serverOwner = guild.owner ?? (guild.members.cache.get(guild.ownerId)?.user ?? null);

       if (!serverOwner) {
         await interaction.reply('Не удалось получить информацию о создателе сервера.');
         return;
       }

    const serverOwnerName = serverOwner.username;
    const serverOwnerDiscriminator = serverOwner.discriminator;
    const serverOwnerId = serverOwner.id;

    const embed = new EmbedBuilder()
      .setColor('#18191c')
      .setImage('https://i.pinimg.com/originals/bc/53/d1/bc53d1661adc7443e7be761f6f6ab961.gif') // Установили указанную ссылку как большую картинку
      .setTitle('⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀**Информация о сервере**')
      .addFields(
        { name: '\u200B', value: '**Дата создания сервера: **' + formattedDate },
        { name: '\u200B', value: '**Всего участников: **' + memberCount.toString() },
        { name: '\u200B', value: '**Активных участников: **' + activeMembers.toString() },
        { name: '\u200B', value: '**Участники в голосовых каналах: **' + voiceChannelMembers.toString() },
        { name: '\u200B', value: '**Создатель сервера: **' + '<@'+serverOwnerId+'>' },
      )
      .setTimestamp() // Добавлено: устанавливаем текущую дату/время как timestamp эмбеда,
      .setFooter({ text: 'De/Generation', iconURL: 'https://i.pinimg.com/564x/88/b2/f7/88b2f7aae4fd60ed92f53f47e5c69daa.jpg' });
      
    await interaction.reply({ embeds: [embed] });
  }
});

client.login(config.token);