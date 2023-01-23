const config = require('./config');

module.exports = async () => {
    if (!global.client) {
        const client = config.Client();
        const login = () => new Promise((res) => client.login(config.Token)
            .then(() => res(true))
            .catch(() => res(false)));
        const ready = () => new Promise((res) => client.on('ready', () => res(true)));

        await login();
        await ready();

        global.client = client;
    };
    
    return global.client;
};