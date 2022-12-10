const sendgrid = require('@sendgrid/mail');
const { config: { apiKey } } = require('./config');

sendgrid.setApiKey(apiKey);

module.exports = {
    sendgrid
};