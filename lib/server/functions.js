const { selectInTable } = require("../mysql/functions");
const { tables } = require("../mysql/queries");


const getServers = async (ownerId) => {
    const { data: { rows: ipServers } } = await selectInTable(tables.ipServers, null, [
        { name: 'owner_id', value: ownerId }
    ]);

    return [...ipServers];
};

module.exports = {
    getServers
};