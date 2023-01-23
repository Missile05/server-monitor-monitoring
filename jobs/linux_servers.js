const { tables } = require('../lib/mysql/queries');
const { selectInTable, updateInTable } = require('../lib/mysql/functions');

const { emails: { statusChanged } } = require('../lib/sendgrid/config');
const { sendEmail } = require('../lib/sendgrid/functions');

const getClient = require('../lib/discord');
const embed = require('../lib/discord/embed');
const colors = require('../lib/discord/colors');

const updateServer = async ({ id, host, port, api_key, owner_id, user, status, nickname }) => {
    const { email, username, subscription } = user;

    if (subscription?.toLowerCase() === 'premium') {
        await updateInTable(tables.linuxServers, [{ name: 'monitoring', value: 'TRUE' }], [{ name: 'id', value: id }]);

        let info;

        try {
            info = await (await fetch(`http://${host}:${port}/${api_key}/info`))?.json();
        }
        catch {
            info = null;
        };

        if (info) {
            await updateInTable(tables.linuxServers, [
                { name: 'status', value: 'ONLINE' },
                { name: 'manufacturer', value: info?.manufacturer ?? 'Unknown' },
                { name: 'model', value: info?.model ?? 'Unknown' },
                { name: 'serial', value: info?.serial ?? 'Unknown' },
                { name: 'bios_vendor', value: info?.bios_vendor ?? 'Unknown' },
                { name: 'bios_serial', value: info?.bios_serial ?? 'Unknown' },
                { name: 'os_kernel', value: info?.os_kernel ?? 'Unknown' },
                { name: 'os_build', value: info?.os_build ?? 'Unknown' },
                { name: 'cpu_usage', value: info?.cpu_usage ?? 0 },
                { name: 'cpu_temperature', value: info?.cpu_temperature ?? 0 },
                { name: 'ram_usage', value: info?.ram_usage ?? 0 },
                { name: 'disk_used', value: info?.disk_used ?? 0 }
            ], [
                { name: 'id', value: id, seperator: 'AND' },
                { name: 'owner_id', value: owner_id }
            ]);

            if (status !== 'ONLINE') {
                const statusEmail = statusChanged('Linux', email, username, nickname, status, 'ONLINE');
        
                await sendEmail(statusEmail);

                const client = await getClient();
                const { data: { rows: statusChannels } } = await selectInTable(tables.discordStatusChannels, 'guild_id,channel_id,ping_everyone', [
                    { name: 'server_id', value: id, seperator: 'AND' },
                    { name: 'server_table', value: tables.linuxServers }
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
                        `The ${nickname} Linux Server has gone from OFFLINE to ONLINE.`,
                        colors.Green,
                        [
                            { name: 'Monitoring', value: '✅ Yes', inline: true },
                            { name: 'Status', value: '✅ Online', inline: true }
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
        }
        else {
            await updateInTable(tables.linuxServers, [
                { name: 'status', value: 'OFFLINE' }
            ], [
                { name: 'id', value: id, seperator: 'AND' },
                { name: 'owner_id', value: owner_id }
            ]);

            if (status !== 'OFFLINE') {
                const statusEmail = statusChanged('Linux', email, username, nickname, status, 'OFFLINE');
        
                await sendEmail(statusEmail);

                const client = await getClient();
                const { data: { rows: statusChannels } } = await selectInTable(tables.discordStatusChannels, 'guild_id,channel_id,ping_everyone', [
                    { name: 'server_id', value: id, seperator: 'AND' },
                    { name: 'server_table', value: tables.linuxServers }
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
                        `The ${nickname} Linux Server has gone from OFFLINE to ONLINE.`,
                        colors.Green,
                        [
                            { name: 'Monitoring', value: '✅ Yes', inline: true },
                            { name: 'Status', value: '❌ Offline', inline: true }
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
    }
    else {
        await updateInTable(tables.linuxServers, [{ name: 'monitoring', value: 'FALSE' }], [{ name: 'id', value: id }]);

        if (status !== 'OFFLINE') {
            const statusEmail = statusChanged('Linux', email, username, nickname, status, 'OFFLINE');
    
            await sendEmail(statusEmail);
        };
    };
};

module.exports = {
    execute: async () => {
        const { data: { rows: servers } } = await selectInTable(tables.linuxServers, 'id,monitoring,owner_id,host,port,api_key,status,nickname');

        servers.forEach(async (s) => {
            const { data: { rows: [user] } } = await selectInTable(tables.users, 'email,username,subscription', [{ name: 'id', value: s?.owner_id }]);

            updateServer({ ...s, user });
        });
    },
    interval: 15000
};