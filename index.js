const ipServers = require('./jobs/ip_servers');
const users = require('./jobs/users');

const jobs = [ipServers, users];

try {
    jobs.forEach(({ execute, interval }) => setInterval(execute, interval));
} catch {};