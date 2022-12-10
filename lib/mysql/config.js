const databaseSettings = {
    host: '172.104.136.151',
    port: '3306',
    user: 'admin',
    password: '6KGyZs1NUE',
    database: 'servermonitor'
};

const poolSettings = {
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
};

module.exports = {
    databaseSettings,
    poolSettings
};