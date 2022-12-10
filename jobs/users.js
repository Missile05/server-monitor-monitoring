const moment = require('moment/moment');
const { plans } = require('../lib/config');

const { tables, updateInTable } = require('../lib/mysql/queries');
const { selectInTable } = require('../lib/mysql/functions');

const updateSubscription = async (id, subscription) => await updateInTable(tables.users, [
    { name: 'subscription', value: subscription }
], [
    { name: 'id', value: id }
]);

module.exports = {
    execute: async () => {
        const subscriptions = plans.filter((p) => p !== 'FREE');
        const { data: { rows: userRows } } = await selectInTable(tables.users, 'id,premium_expiry,plus_expiry,subscription');

        const users = userRows?.filter(({ subscription }) => subscriptions.includes(subscription));

        users?.forEach(async ({ id, premium_expiry, plus_expiry }) => {
            const premiumExpiry = premium_expiry;
            const plusExpiry = plus_expiry;

            const getPlanTime = (expiry) => moment(expiry).diff(moment(), 'days') ?? 0;
            const isExpired = (expiry) => expiry ? getPlanTime(expiry) <= 0 : true;

            const premiumExpired = isExpired(premiumExpiry);
            const plusExpired = isExpired(plusExpiry);

            if (premiumExpired && !plusExpired) updateSubscription(id, 'PLUS');
            else if (plusExpired && !premiumExpired) updateSubscription(id, 'PREMIUM');
            else if (premiumExpired && plusExpired) updateSubscription(id, 'FREE');
        });
    },
    interval: 10000
};