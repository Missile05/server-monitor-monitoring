const { tables } = require('../lib/mysql/queries');
const { selectInTable, updateInTable } = require('../lib/mysql/functions');

const { emails: { statusChanged } } = require('../lib/sendgrid/config');
const { sendEmail } = require('../lib/sendgrid/functions');

const updateServer = async ({ id, host, port, api_key, owner_id, user, status }) => {
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
        const { data: { rows: servers } } = await selectInTable(tables.linuxServers, 'id,monitoring,owner_id,host,port,api_key,status');

        servers.forEach(async (s) => {
            const { data: { rows: [user] } } = await selectInTable(tables.users, 'email,username,subscription', [{ name: 'id', value: s?.owner_id }]);

            updateServer({ ...s, user });
        });
    },
    interval: 5000
};