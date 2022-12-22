const ping = require('ping');

const { tables } = require('../lib/mysql/queries');
const { selectInTable, updateInTable } = require('../lib/mysql/functions');

const { emails: { statusChanged } } = require('../lib/sendgrid/config');
const { sendEmail } = require('../lib/sendgrid/functions');

const { plans } = require('../lib/config');

module.exports = {
    execute: async () => {
        const { data: { rows: servers } } = await selectInTable(tables.ipServers, 'id,nickname,owner_id,ip_address,status');

        servers?.forEach(({ id, ip_address, status, nickname, owner_id }) => ping.promise.probe(ip_address, { timeout: 10 })
            .then(async (res) => {
                const reachable = res?.alive ?? false;
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
            })
            .catch(() => false));
    },
    interval: 10000
};