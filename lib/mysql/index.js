const mysql = require('mysql2/promise');
const { databaseSettings, poolSettings } = require('../../../config');

if (!global.pool) global.pool = mysql.createPool({ ...databaseSettings, ...poolSettings });

const pool = global.pool;

module.exports = { pool };