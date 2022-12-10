const { pool } = require('../mysql');
const {
    selectInTable: selectQuery,
    insertIntoTable: insertQuery,
    deleteFromTable: deleteQuery,
    updateInTable: updateQuery
} = require('./queries');

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

module.exports = {
    queryDatabase,
    multiQueryDatabase,
    selectInTable,
    insertIntoTable,
    deleteFromTable,
    updateInTable
};