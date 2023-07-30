async function handleGuildInfo(guild) {
  // Получаем всех участников сервера с их статусами
  const members = await guild.members.fetch({ withPresences: true, force: true });
  const nonBotMembers = members.filter((member) => !member.user.bot);

  const memberCount = nonBotMembers.size;
  const activeMembers = nonBotMembers.filter((member) => member.presence?.status === 'online').size;
  const offlineMembers = memberCount - activeMembers;

  const voiceChannels = guild.channels.cache.filter((channel) => channel.type === 'GUILD_VOICE');
  const voiceChannelMembers = voiceChannels.reduce((totalMembers, voiceChannel) => {
    const membersInChannel = voiceChannel.members.filter((member) => !member.user.bot).size;
    return totalMembers + membersInChannel;
  }, 0);

  return { voiceChannelMembers, offlineMembers };
}

module.exports = {
  handleGuildInfo,
};
