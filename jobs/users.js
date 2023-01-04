const moment = require('moment/moment');
const { plans } = require('../lib/config');

const { tables } = require('../lib/mysql/queries');
const { selectInTable, updateInTable } = require('../lib/mysql/functions');

const updateSubscription = async (id, subscription) => await updateInTable(tables.users, [
    { name: 'subscription', value: subscription }
], [
    { name: 'id', value: id }
]);

module.exports = {
    execute: async () => {
        const { data: { rows: users } } = await selectInTable(tables.users, 'id,premium_expiry,plus_expiry,subscription');

        users?.forEach(async ({ id, premium_expiry, plus_expiry, subscription }) => {
            /* Handle Expiration */
            const premiumExpiry = premium_expiry;
            const plusExpiry = plus_expiry;

            const getPlanTime = (expiry) => moment(expiry).diff(moment(), 'days') ?? 0;
            const isExpired = (expiry) => expiry ? getPlanTime(expiry) <= 0 : true;

            const premiumExpired = isExpired(premiumExpiry);
            const plusExpired = isExpired(plusExpiry);

            if (premiumExpired && !plusExpired) updateSubscription(id, 'PLUS');
            else if (plusExpired && !premiumExpired) updateSubscription(id, 'PREMIUM');
            else if (premiumExpired && plusExpired) updateSubscription(id, 'FREE');

            /* Handle Server Limit */
            const { data: { rows: ipServers } } = await selectInTable(tables.ipServers, 'id, monitoring', [{ name: 'owner_id', value: id }]);
            const { data: { rows: robloxServers } } = await selectInTable(tables.robloxServers, 'id, monitoring', [{ name: 'owner_id', value: id }]);
            const { data: { rows: linuxServers } } = await selectInTable(tables.linuxServers, 'id, monitoring', [{ name: 'owner_id', value: id }]);
            const servers = [
                ...ipServers?.map((s) => ({ table: tables.ipServers, ...s })),
                ...robloxServers?.map((s) => ({ table: tables.robloxServers, ...s })),
                ...linuxServers?.map((s) => ({ table: tables.linuxServers, ...s })),
            ];

            const serverLimit = subscription === 'PREMIUM' ? 15 : subscription === 'PLUS' ? 7 : 2;
            
            if (servers?.length > serverLimit) servers?.forEach(async ({ table, id }, idx) => await updateInTable(table, [
                { name: 'monitoring', value: idx >= serverLimit ? 'FALSE' : 'TRUE' }
            ], [
                { name: 'id', value: id }
            ]))
            else servers?.filter(({ monitoring }) => monitoring === 'FALSE').forEach(async ({ table, id }, idx) => await updateInTable(table, [
                { name: 'monitoring', value: 'TRUE' }
            ], [
                { name: 'id', value: id }
            ]));
        });
    },
    interval: 15000
};