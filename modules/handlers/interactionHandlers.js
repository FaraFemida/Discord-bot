const { EmbedBuilder } = require('discord.js');
const { format } = require('date-fns');
const { ru } = require('date-fns/locale');
const client = require('../modules/discordClient.js');

client.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand() && interaction.commandName === 'serverinfo') {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply('Команда доступна только на сервере!');
      return;
    }

    const members = await guild.members.fetch();
    const nonBotMembers = members.filter((member) => !member.user.bot);
    const memberCount = nonBotMembers.size;
    const activeMembers = nonBotMembers.filter((member) => member.presence?.status !== 'offline').size;
    const offlineMembers = memberCount - activeMembers;
    const voiceChannels = await guild.channels.fetch();
    const filteredVoiceChannels = voiceChannels.filter(channel => channel.type === 'GUILD_VOICE');
    const voiceChannelMembers = filteredVoiceChannels.reduce(
      (totalMembers, voiceChannel) => totalMembers + voiceChannel.members.size,
      0
    );

    const createdAt = guild.createdAt;
    const formattedDate = format(createdAt, 'PPP', { locale: ru });

    const serverOwner = guild.owner ?? (guild.members.cache.get(guild.ownerId)?.user ?? null);
    if (!serverOwner) {
      await interaction.reply('Не удалось получить информацию о создателе сервера.');
      return;
    }

    const serverOwnerId = serverOwner.id;

    const embed = new EmbedBuilder()
      .setColor('#18191c')
      .setImage('https://i.pinimg.com/originals/bc/53/d1/bc53d1661adc7443e7be761f6f6ab961.gif')
      .setTitle('⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀**Информация о сервере**')
      .addFields(
        { name: '\u200B', value: '<:memberblue:1134987992554025101> **Всего участников: **' + memberCount.toString(), inline: true },
        { name: '\u200B', value: '<:membergreen:1134984700230914118> **Онлайн участники: **' + activeMembers.toString(), inline: true },
        { name: '\u200B', value: '<:memberred:1134984695604588605> **Оффлайн участники: **' + offlineMembers.toString(), inline: true },
        { name: '\u200B', value: '<:voicebadge:1134988862536560721> **Участники в голосовых каналах: **' + voiceChannelMembers.toString(), inline: true },
        { name: '\u200B', value: '<:serverinfo:1134989793294549103> **Дата создания сервера: **' + formattedDate, inline: true },
        { name: '\u200B', value: '<:ownercrown:1134984698393804920> **Создатель сервера: **' + '<@'+serverOwnerId+'>', inline: true },
      )
      .setTimestamp()
      .setFooter({ text: 'De/Generation', iconURL: 'https://i.pinimg.com/564x/88/b2/f7/88b2f7aae4fd60ed92f53f47e5c69daa.jpg' });
      
    await interaction.reply({ embeds: [embed] });
  }
});
