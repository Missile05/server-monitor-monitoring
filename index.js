const IPServers = require('./jobs/ip_servers');
const RobloxServers = require('./jobs/roblox_servers');
const LinuxServers = require('./jobs/linux_servers');
const FivemServers = require('./jobs/fivem_servers');

const Jobs = [IPServers, RobloxServers, LinuxServers, FivemServers];

try {
    Jobs.forEach(({ execute, interval }) => setInterval(() => {
        try { execute(); }
        catch {};
    }, interval));
} catch {};