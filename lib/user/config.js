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
    subscription: {
        servers: {
            'FREE': 2,
            'PLUS': 7,
            'PREMIUM': 15
        }
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
    'subscription',
    'plus_expiry',
    'premium_expiry'
];

module.exports = {
    lengths,
    regex,
    returnColumns
};