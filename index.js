// temp

const ipServers = require('./jobs/ip_servers');
const jobs = [ipServers];

try {
    jobs.forEach(({ execute, interval }) => setInterval(execute, interval));
} catch {};