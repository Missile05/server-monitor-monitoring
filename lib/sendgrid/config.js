const { default: links } = require('../links');

const config = {
    apiKey: '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',
    email: {
        email: 'no-reply@server-monitor.org',
        name: 'Server Monitor'
    },
    siteUrl: 'https://server-monitor.org',
};

const emailTemplate = (username, email) => `Hello ${username},<br/><br/>${email}<br/><br/>This is an automated reply.<br/><br/>Server Monitor`;

const emails = {
    statusChanged: (email, username, nickname, old_status, status) => ({
        to: email,
        from: config.email,
        subject: `IP Server '${nickname}' is ${status}`,
        html: emailTemplate(username, `The IP Server '${nickname}' that you've set up with Server Monitor has gone from ${old_status} to ${status}.<br/>Please note: our services may not always be correct, as it is possible our server's IP has been blacklisted by your firewall; this is unlikely however.`)
    })
};

module.exports = {
    config,
    emailTemplate,
    emails
};