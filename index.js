const IPServers = require('./jobs/ip_servers');
const RobloxServers = require('./jobs/roblox_servers');
const LinuxServers = require('./jobs/linux_servers');
const FivemServers = require('./jobs/fivem_servers');

const Users = require('./jobs/users');

const Jobs = [IPServers, RobloxServers, LinuxServers, FivemServers, Users];

try {
    Jobs.forEach(({ execute, interval }) => setInterval(() => {
        try { execute(); }
        catch {};
    }, interval));
} catch {};