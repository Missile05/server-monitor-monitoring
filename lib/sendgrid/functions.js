const { sendgrid } = require('../sendgrid');

const sendEmail = (email) => sendgrid.send(email)
    .then(() => ({ success: true }))
    .catch((error) => ({ error }));

module.exports = {
    sendEmail
};