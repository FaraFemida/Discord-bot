const client = require('./modules/discordClient.js');
require('./modules/commands/slashCommands.js');
require('./handlers/interactionHandlers.js');

const config = require('./config.json');
client.login(config.token);
