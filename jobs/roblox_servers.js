const { tables } = require('../lib/mysql/queries');
const { selectInTable, updateInTable, getRobloxGameInfo } = require('../lib/mysql/functions');

const updateServer = async ({ id, universe_id, owner_id, user }) => {
    const { subscription } = user;

    if (subscription?.toLowerCase() === 'premium') {
        await updateInTable(tables.robloxServers, [{ name: 'monitoring', value: 'TRUE' }], [{ name: 'id', value: id }]);

        const gameInfo = await getRobloxGameInfo(universe_id);

        if (gameInfo?.success) await updateInTable(tables.robloxServers, [
            { name: 'name', value: gameInfo?.name ?? 'Unknown' },
            { name: 'description', value: gameInfo?.description ?? 'Unknown' },
            { name: 'creator_name', value: gameInfo?.creator_name ?? 'Unknown' },
            { name: 'creator_type', value: gameInfo?.creator_type ?? 'Unknown' },
            { name: 'price', value: gameInfo?.price ?? 'Unknown' },
            { name: 'copying_allowed', value: gameInfo?.copying_allowed ?? 'Unknown' },
            { name: 'max_players', value: gameInfo?.max_players ?? 'Unknown' },
            { name: 'game_created', value: gameInfo?.game_created ?? 'Unknown' },
            { name: 'game_updated', value: gameInfo?.game_updated ?? 'Unknown' },
            { name: 'genre', value: gameInfo?.genre ?? 'Unknown' },
            { name: 'playing', value: gameInfo?.playing ?? 0 },
            { name: 'visits', value: gameInfo?.visits ?? 0 },
            { name: 'favorites', value: gameInfo?.favorites ?? 0 },
            { name: 'likes', value: gameInfo?.likes ?? 0 },
            { name: 'dislikes', value: gameInfo?.dislikes ?? 0 }
        ], [
            { name: 'id', value: id, seperator: 'AND' },
            { name: 'owner_id', value: owner_id }
        ]);
    } else await updateInTable(tables.robloxServers, [{ name: 'monitoring', value: 'FALSE' }], [{ name: 'id', value: id }]);
};

module.exports = {
    execute: async () => {
        const { data: { rows: servers } } = await selectInTable(tables.robloxServers, 'id,monitoring,owner_id,universe_id');

        servers.forEach(async (s) => {
            const { data: { rows: [user] } } = await selectInTable(tables.users, 'subscription', [{ name: 'id', value: s?.owner_id }]);

            updateServer({ ...s, user });
        });
    },
    interval: 15000
};