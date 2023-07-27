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

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
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
    const serverName = guild.name;
    const voiceChannels = guild.channels.cache.filter((channel) => channel.type === 'GUILD_VOICE'); // Добавлено: Получаем список голосовых каналов сервера
    const voiceChannelMembers = voiceChannels.reduce((totalMembers, voiceChannel) => totalMembers + voiceChannel.members.size, 0); // Добавлено: Считаем количество участников в голосовых каналах
    const createdAt = guild.createdAt;
    const formattedDate = format(createdAt, 'PPP', { locale: ru }); // Форматируем дату в виде 'день месяц год' (например, '28 июля 2023')

    const embed = new EmbedBuilder()
      .setColor('#18191c')
      .setImage('https://i.pinimg.com/originals/bc/53/d1/bc53d1661adc7443e7be761f6f6ab961.gif') // Установили указанную ссылку как большую картинку
      .setTitle('Информация о сервере')
      .addFields(
        { name: 'Имя сервера', value: serverName.toString(), inline: true },
        { name: `Дата создания сервера`, value: formattedDate, inline: true },
        { name: `Всего участников`, value: memberCount.toString(), inline: true},
        { name: `Активных участников`, value: activeMembers.toString(), inline: true },
        { name: 'Участники в голосовых каналах', value: voiceChannelMembers.toString(), inline: true },
      )
      .setTimestamp() // Добавлено: устанавливаем текущую дату/время как timestamp эмбеда,
      .setFooter({ text: 'De/Generation', iconURL: 'https://i.pinimg.com/564x/88/b2/f7/88b2f7aae4fd60ed92f53f47e5c69daa.jpg' });
      
    await interaction.reply({ embeds: [embed] });
  }
});

client.login(config.token);
