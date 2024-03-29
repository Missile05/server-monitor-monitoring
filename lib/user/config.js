const lengths = {
    email: {
        min: 5,
        max: 100
    },
    username: {
        min: 4,
        max: 20
    },
    password: {
        min: 6,
        max: 50
    },
    server_nickname: {
        min: 4,
        max: 20
    }
};

const regex = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    username: /^[a-zA-Z0-9]*$/,
    password: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/,
    server_nickname: /^[a-zA-Z0-9]*$/
};

const returnColumns = [
    'email',
    'username',
];

module.exports = {
    lengths,
    regex,
    returnColumns
};