const ping = require('ping');

const { tables } = require('../lib/mysql/queries');
const { selectInTable, updateInTable, checkConnection } = require('../lib/mysql/functions');

const { emails: { statusChanged } } = require('../lib/sendgrid/config');
const { sendEmail } = require('../lib/sendgrid/functions');

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