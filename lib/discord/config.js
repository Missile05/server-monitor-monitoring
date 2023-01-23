const { Client, GatewayIntentBits } = require('discord.js');

module.exports = {
    Token: 'OTgxNjI3ODAxNjgzNzcxNDMy.GErWBs.7FIxYjG17b7U_-iusstdrXum2bJAjG7cSjaDLc',
    Client: () => new Client({ intents: [GatewayIntentBits.Guilds] })
};