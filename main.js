const { Client, GatewayIntentBits, EmbedBuilder, Partials } = require('discord.js');
const { format } = require('date-fns');
const { ru } = require('date-fns/locale');
const config = require('./config.json');

const client = new Client({
  partials: [Partials.MESSAGE, Partials.CHANNEL, Partials.REACTION],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates, // Добавляем право GUILD_VOICE_STATES
    GatewayIntentBits.GuildMembers, // Добавляем право GUILD_MEMBERS
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

  const { commandName } = interaction; // Переместили определение переменной guild сюда

  if (commandName === 'serverinfo') {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply('Команда доступна только на сервере!');
      return;
    }

    // Получаем общее количество участников здесь
    const memberCount = interaction.guild?.memberCount ?? 0;
    const activeMembers = guild.members.cache.filter((member) => member.presence?.status !== 'offline').size;

    // Количество офлайн участников = общее количество участников - количество активных участников
    const offlineMembers = memberCount - activeMembers;

    const voiceChannels = guild.channels.cache.filter((channel) => channel.type === 'GUILD_VOICE'); // Добавлено: Получаем список голосовых каналов сервера

           // Подсчитываем общее количество участников в голосовых каналах
           let voiceChannelMembersCount = 0;
           voiceChannels.forEach((voiceChannel) => {
             voiceChannelMembersCount += voiceChannel.members.size;
           });
           
    const voiceChannelMembers = voiceChannels.reduce((totalMembers, voiceChannel) => totalMembers + voiceChannel.members.size, 0); // Добавлено: Считаем количество участников в голосовых каналах
    const createdAt = guild.createdAt;
    const formattedDate = format(createdAt, 'PPP', { locale: ru }); // Форматируем дату в виде 'день месяц год' (например, '28 июля 2023')

       // Проверяем, доступен ли объект "guild.owner", иначе пытаемся получить информацию из кэша гильдии
       const serverOwner = guild.owner ?? (guild.members.cache.get(guild.ownerId)?.user ?? null);

       if (!serverOwner) {
         await interaction.reply('Не удалось получить информацию о создателе сервера.');
         return;
       }

    const serverOwnerId = serverOwner.id;

    const embed = new EmbedBuilder()
      .setColor('#18191c')
      .setImage('https://i.pinimg.com/originals/bc/53/d1/bc53d1661adc7443e7be761f6f6ab961.gif') // Установили указанную ссылку как большую картинку
      .setTitle('⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀**Информация о сервере**')
      .addFields(
        { name: '\u200B', value: '<:serverinfo:1134989793294549103> **Дата создания сервера: **' + formattedDate, inline: true },
        { name: '\u200B', value: '<:memberblue:1134987992554025101> **Всего участников: **' + memberCount.toString(), inline: true },
        { name: '\u200B', value: '<:membergreen:1134984700230914118> **Онлайн участники: **' + activeMembers.toString(), inline: true },
        { name: '\u200B', value: '<:memberred:1134984695604588605> **Оффлайн участники: **' + offlineMembers.toString(), inline: true },
        { name: '\u200B', value: '<:voicebadge:1134988862536560721> **Участники в голосовых каналах: **' + voiceChannelMembers.toString(), inline: true },
        { name: '\u200B', value: '<:ownercrown:1134984698393804920> **Создатель сервера: **' + '<@'+serverOwnerId+'>', inline: true },
      )
      .setTimestamp() // Добавлено: устанавливаем текущую дату/время как timestamp эмбеда,
      .setFooter({ text: 'De/Generation', iconURL: 'https://i.pinimg.com/564x/88/b2/f7/88b2f7aae4fd60ed92f53f47e5c69daa.jpg' });
      
    await interaction.reply({ embeds: [embed] });
  }
});

client.login(config.token);