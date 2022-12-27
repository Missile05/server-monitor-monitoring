const IPServers = require('./jobs/ip_servers');
const RobloxServers = require('./jobs/roblox_servers');

const Users = require('./jobs/users');

const Jobs = [IPServers, RobloxServers, Users];

try {
    Jobs.forEach(({ execute, interval }) => setInterval(execute, interval));
} catch {};