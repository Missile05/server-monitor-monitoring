const ping = require('ping');
const getClient = require('../lib/discord');

const { tables } = require('../lib/mysql/queries');
const { selectInTable, updateInTable, checkConnection } = require('../lib/mysql/functions');

const { emails: { statusChanged } } = require('../lib/sendgrid/config');
const { sendEmail } = require('../lib/sendgrid/functions');

const embed = require('../lib/discord/embed');
const colors = require('../lib/discord/colors');

const updateServer = async (reachable, id, status, nickname, user, time, old_response_time) => {
    const new_status = reachable ? 'ONLINE' : 'OFFLINE';

    await updateInTable(tables.ipServers, [{ name: 'monitoring', value: 'TRUE' }], [{ name: 'id', value: id }]);

    const time_now = Date.now();
    const response_time = Math.round((time_now - time) * 10) / 10;

    if (response_time !== old_response_time) await updateInTable(tables.ipServers, [
        { name: 'response_time', value: response_time }
    ], [
        { name: 'id', value: id }
    ]);

    if (status !== new_status) {
        await updateInTable(tables.ipServers, [{ name: 'status', value: new_status }], [{ name: 'id', value: id }]);
        
        const { email, username, subscription } = user;

        if (['plus', 'premium'].includes(subscription?.toLowerCase())) {
            const statusEmail = statusChanged('IP', email, username, nickname, status, new_status);
        
            await sendEmail(statusEmail);

            const client = await getClient();
            const { data: { rows: statusChannels } } = await selectInTable(tables.discordStatusChannels, 'guild_id,channel_id,ping_everyone', [
                { name: 'server_id', value: id, seperator: 'AND' },
                { name: 'server_table', value: tables.ipServers }
            ]);

            statusChannels.forEach(async ({ guild_id, channel_id, ping_everyone }) => {
                if (!guild_id || !channel_id) return;
                
                let guild;

                try {
                    guild = await client?.guilds?.fetch(guild_id);
                }
                catch {
                    return;
                }

                if (!guild) return;

                let channel;

                try {
                    channel = await guild?.channels?.fetch(channel_id);
                }
                catch {
                    return;
                }

                if (!channel) return;

                const statusEmbed = embed(
                    client,
                    `📊 ${nickname} status changed`,
                    `The ${nickname} IP Server has gone from ${status} to ${new_status}.`,
                    colors.Green,
                    [
                        { name: 'Monitoring', value: '✅ Yes', inline: true },
                        { name: 'Status', value: new_status === 'ONLINE' ? '✅ Online' : server?.status === 'OFFLINE' ? '❌ Offline' : '⚠️ Pending / Unknown', inline: true },
                        { name: 'Response Time', value: `⌛ ${response_time} ms`, inline: true }
                    ]
                );
                
                try {
                    await channel.send({ content: ping_everyone === 'TRUE' ? '@everyone' : '', embeds: [statusEmbed] });
                }
                catch {
                    return;
                };
            });
        };
    };
};

module.exports = {
    execute: async () => {
        const { data: { rows: servers } } = await selectInTable(tables.ipServers, 'id,monitoring,nickname,owner_id,ip_address,status,response_time');

        servers?.forEach(async ({ id, ip_address, status, nickname, owner_id, response_time, monitoring }) => {
            if (monitoring === 'FALSE') return;

            const { data: { rows: [user] } } = await selectInTable(tables.users, 'email,username,subscription', [{ name: 'id', value: owner_id }]);

            const [ ip, port ] = ip_address?.split(':');
            const time = Date.now();

            const info = [ id, status, nickname, user, time, response_time ];

            if (!port) ping.promise.probe(ip, { timeout: 5 })
                .then(async (res) => await updateServer(res?.alive ?? false, ...info))
                .catch(() => false);
            else checkConnection(ip, port)
                .then(async () => await updateServer(true, ...info))
                .catch(async () => await updateServer(false, ...info));
        });
    },
    interval: 15000
};