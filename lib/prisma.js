const { PrismaClient } = require('@prisma/client');
let tprisma;

if (process.env.NODE_ENV === 'production') tprisma = new PrismaClient();
else {
    if (!global.prisma) global.prisma = new PrismaClient();

    tprisma = global.prisma;
};

module.exports = tprisma;