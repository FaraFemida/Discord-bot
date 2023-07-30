const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
  partials: [Partials.MESSAGE, Partials.CHANNEL, Partials.REACTION],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ],
  cacheGuilds: false,
});

module.exports = client;
