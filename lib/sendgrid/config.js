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
    registered: (email, username, code, codeString) => ({
        to: email,
        from: config.email,
        subject: `Your verification code is ${codeString}`,
        html: emailTemplate(username, `Thanks for registering an account with us.<br/><br/>Your verification code is: <b>${codeString}</b> (or <a href="${config.siteUrl}${links.verifyEmail}?email=${email}&code=${code}">click here</a>).<br/><br/>Note: if you did not register on our website, ignore this message.`)
    }),
    forgotPassword: (email, username, code, codeString) => ({
        to: email,
        from: config.email,
        subject: `Your reset code is ${codeString}`,
        html: emailTemplate(username, `You've submitted a request to reset your password.<br/><br/>Your reset code is: <b>${codeString}</b> (or <a href="${config.siteUrl}${links.forgotPassword}?email=${email}&code=${code}">click here</a>).<br/><br/>Note: if you did not request to reset your password, ignore this message.`)
    }),
    deleted: (email, username) => ({
        to: email,
        from: config.email,
        subject: `Goodbye ${username}`,
        html: emailTemplate(username, `You've deleted your account along with all data.<br/><br/>We hope you've enjoyed your stay at Server Monitor.<br/>If you ever change your mind, <a href="${config.siteUrl}${links.register}">register another account with us.</a>.<br/><br/>Note: if you did not delete your account, please contact support.<br/>We are unable to reverse the deletion or restore any data.`)
    }),
};

module.exports = {
    config,
    emailTemplate,
    emails
};