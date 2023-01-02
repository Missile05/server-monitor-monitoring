const config = {
    apiKey: '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',
    email: {
        email: 'no-reply@server-monitor.org',
        name: 'Server Monitor'
    },
    siteUrl: 'https://server-monitor.org',
};

const moment = require('moment/moment');

const emailTemplate = (username, email) => `Hello ${username},<br/><br/>${email}<br/><br/>This is an automated reply.<br/><br/>Server Monitor`;

const emails = {
    statusChanged: (type, email, username, nickname, old_status, status) => ({
        to: email,
        from: config.email,
        subject: `${type} Server '${nickname}' is ${status} [${moment.utc().format("HH:mm:ss")} UTC]`,
        html: emailTemplate(username, `The ${type} Server '${nickname}' that you've set up with Server Monitor has gone from ${old_status} to ${status}.`)
    })
};

module.exports = {
    config,
    emailTemplate,
    emails
};