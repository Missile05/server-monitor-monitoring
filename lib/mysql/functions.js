const { pool } = require('../mysql');
const {
    selectInTable: selectQuery,
    insertIntoTable: insertQuery,
    deleteFromTable: deleteQuery,
    updateInTable: updateQuery
} = require('./queries');


const moment = require('moment/moment');
const net = require('net');
const Promise = require('bluebird');

const queryDatabase = async (query, execute) => {
    try {
        const [rows, fields] = await (Array.isArray(execute) ? pool.execute(query, execute) : pool.query(query));

        return ({ rows, fields });
    }
    catch (error) { return ({ error }); }
};

const multiQueryDatabase = async (queries) => await queryDatabase(queries.join(' '));

const selectInTable = async (table, select, where) => {
    if (!table) return { exists: false, data: { error: 'Incorrect parameters.' } };

    const data = await queryDatabase(selectQuery(table, select, where), where?.map(({ value }) => value ?? ''));
    const exists = data?.rows?.length > 0 ?? false;

    return { exists, data };
};

const insertIntoTable = async (table, items) => !(table && items)
    ? { error: 'Incorrect parameters.' }
    : await queryDatabase(insertQuery(table, items), items?.map(({ value }) => value ?? ''));

const deleteFromTable = async (table, where) => !(table && where)
    ? { error: 'Incorrect parameters.' }
    : await queryDatabase(deleteQuery(table, where), where?.map(({ value }) => value ?? ''));

const updateInTable = async (table, set, where) => !(table && set && where)
    ? { error: 'Incorrect parameters.' }
    : await queryDatabase(updateQuery(table, set, where), [...set?.map(({ value }) => value), ...where?.map(({ value }) => value)]);

const checkConnection = (ip, port, timeout) => new Promise((resolve, reject) => {
    timeout = timeout || 5000;

    const timer = setTimeout(() => {
        reject('timeout');
        socket.end();
    }, timeout);

    const socket = net.createConnection(port ?? 80, ip, () => {
        clearTimeout(timer);
        resolve();
        socket.end();
    });

    socket.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
    });
});

const getRobloxGameInfo = async (universeId) => {
    const data = await (await (await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`))?.json())?.data[0];
    const likeData = await (await (await fetch(`https://games.roblox.com/v1/games/votes?universeIds=${universeId}`))?.json())?.data[0];

    return data?.id ? {
        success: true,
        id: data?.id,
        name: data?.name,
        description: data?.description?.split('')?.splice(0, 50)?.join(''),
        creator_name: data?.creator?.name,
        creator_type: data?.creator?.type,
        price: data?.price ?? 0,
        copying_allowed: data?.copyingAllowed ? 'True' : 'False',
        max_players: data?.maxPlayers,
        game_created: moment(data?.created)?.format('MM/DD/YYYY h:mm:ss a'),
        game_updated: moment(data?.updated)?.format('MM/DD/YYYY h:mm:ss a'),
        genre: data?.genre,
        playing: data?.playing,
        visits: data?.visits,
        favorites: data?.favoritedCount,
        likes: likeData?.upVotes,
        dislikes: likeData?.downVotes
    } : {
        success: false
    };
};

const getRobloxUniverseId = async (id) => {
    const universeIdData = await (await (await fetch(`https://games.roblox.com/v1/games?universeIds=${id}`))?.json())?.data[0];
    const universeId = await (await (await fetch(`https://apis.roblox.com/universes/v1/places/${id}/universe`))?.json())?.universeId;

    return universeIdData?.id ? id : universeId;
};

module.exports = {
    queryDatabase,
    multiQueryDatabase,
    selectInTable,
    insertIntoTable,
    deleteFromTable,
    updateInTable,
    checkConnection,
    getRobloxGameInfo,
    getRobloxUniverseId
};