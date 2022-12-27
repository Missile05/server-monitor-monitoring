const { tables } = require('../lib/mysql/queries');
const { selectInTable, updateInTable, getRobloxGameInfo } = require('../lib/mysql/functions');

const updateServer = async ({ id, place_id, owner_id, user }) => {
    const { subscription } = user;

    if (subscription?.toLowerCase() === 'premium') {
        await updateInTable(tables.robloxServers, [{ name: 'monitoring', value: 'TRUE' }], [{ name: 'id', value: id }]);

        const gameInfo = await getRobloxGameInfo(place_id);

        if (gameInfo?.success) await updateInTable(tables.robloxServers, [
            { name: 'name', value: gameInfo?.name },
            { name: 'description', value: gameInfo?.description },
            { name: 'creator_name', value: gameInfo?.creator_name },
            { name: 'creator_type', value: gameInfo?.creator_type },
            { name: 'price', value: gameInfo?.price },
            { name: 'copying_allowed', value: gameInfo?.copying_allowed },
            { name: 'max_players', value: gameInfo?.max_players },
            { name: 'game_created', value: gameInfo?.game_created },
            { name: 'game_updated', value: gameInfo?.game_updated },
            { name: 'genre', value: gameInfo?.genre },
            { name: 'playing', value: gameInfo?.playing },
            { name: 'visits', value: gameInfo?.visits },
            { name: 'favorites', value: gameInfo?.favorites },
            { name: 'likes', value: gameInfo?.likes },
            { name: 'dislikes', value: gameInfo?.dislikes }
        ], [
            { name: 'id', value: id, seperator: 'AND' },
            { name: 'owner_id', value: owner_id }
        ]);
    } else await updateInTable(tables.robloxServers, [{ name: 'monitoring', value: 'FALSE' }], [{ name: 'id', value: id }]);
};

module.exports = {
    execute: async () => {
        const { data: { rows: servers } } = await selectInTable(tables.robloxServers, 'id,monitoring,owner_id,place_id');

        servers.forEach(async (s) => {
            const { data: { rows: [user] } } = await selectInTable(tables.users, 'subscription', [{ name: 'id', value: s?.owner_id }]);

            updateServer({ ...s, user })
        });
    },
    interval: 5000
};