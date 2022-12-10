const ping = require('ping');

const { tables } = require('../lib/mysql/queries');
const { selectInTable, updateInTable } = require('../lib/mysql/functions');

module.exports = {
    execute: async () => {
        const { data: { rows: servers } } = await selectInTable(tables.ipServers, 'id,ip_address,status');

        servers?.forEach(({ id, ip_address, status }) => ping.promise.probe(ip_address, { timeout: 10 })
            .then(async (res) => {
                const reachable = res?.alive ?? false;
                const new_status = reachable ? 'ONLINE' : 'OFFLINE';

                if (status !== new_status) await updateInTable(tables.ipServers, [
                    { name: 'status', value: new_status }
                ], [
                    { name: 'id', value: id, seperator: 'AND' },
                    { name: 'ip_address', value: ip_address }
                ]);
            })
            .catch(() => false));
    },
    interval: 10000
};