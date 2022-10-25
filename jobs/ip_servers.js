const prisma = require('../lib/prisma');
const ping = require('ping');

module.exports = {
    execute: async () => {
        const servers = await prisma.IPServer.findMany();

        servers?.forEach(async ({ id, ip_address }) => await ping.promise.probe(ip_address, { timeout: 10 })
            .then(async (res) => {
                const reachable = res?.alive ?? false;

                prisma.IPServer.update({ where: { id }, data: { status: reachable ? 'ONLINE' : 'OFFLINE' } })
                    .catch();
            })
            .catch());
    },
    interval: 10000
};