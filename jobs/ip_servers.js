const ping = require('ping');

const { tables } = require('../lib/mysql/queries');
const { selectInTable, updateInTable, checkConnection } = require('../lib/mysql/functions');

const { emails: { statusChanged } } = require('../lib/sendgrid/config');
const { sendEmail } = require('../lib/sendgrid/functions');

const updateServer = async (reachable, ip_address, id, status, nickname, owner_id) => {
    const new_status = reachable ? 'ONLINE' : 'OFFLINE';

    if (status !== new_status) {
        await updateInTable(tables.ipServers, [
            { name: 'status', value: new_status }
        ], [
            { name: 'id', value: id, seperator: 'AND' },
            { name: 'ip_address', value: ip_address }
        ]);
        
        const { data: { rows: users } } = await selectInTable(tables.users, 'email,username,subscription', [
            { name: 'id', value: owner_id }
        ]);

        const { email, username, subscription } = users[0];

        if (['plus', 'premium'].includes(subscription?.toLowerCase())) {
            const statusEmail = statusChanged(email, username, nickname, status, new_status);
        
            await sendEmail(statusEmail);
        };
    };
};

module.exports = {
    execute: async () => {
        const { data: { rows: servers } } = await selectInTable(tables.ipServers, 'id,nickname,owner_id,ip_address,status');

        servers?.forEach(({ id, ip_address, status, nickname, owner_id }) => {
            const [ ip, port ] = ip_address?.split(':');

            if (!port) ping.promise.probe(ip, { timeout: 10 })
                .then(async (res) => await updateServer(res?.alive ?? false, ip_address, id, status, nickname, owner_id))
                .catch(() => false);
            else checkConnection(ip, port)
                .then(async () => await updateServer(true, ip_address, id, status, nickname, owner_id))
                .catch(async () => await updateServer(false, ip_address, id, status, nickname, owner_id));
        });
    },
    interval: 10000
};