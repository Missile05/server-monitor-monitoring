const { regex } = require('./config');

const validateLength = (object, lengths) => object?.length >= lengths?.min && object?.length <= lengths?.max;
const invalidLength = (name, lengths) => `${name} has to be ${lengths?.min} - ${lengths?.max} characters.`;

const validateEmail = (email) => regex.email.test(email);
const invalidEmail = 'Invalid email address.';

const validateUsername = (username) => regex.username.test(username);
const invalidUsername = 'Username must only have letters and numbers.';

const validatePassword = (password) => regex.password.test(password);
const invalidPassword = 'Password must have one uppercase letter, one lowercase letter, one number, and one special character (@, #, \\, $, &, !, ?).';

const validateServerNickname = (nickname) => regex.server_nickname.test(nickname);
const invalidServerNickname = 'Nickname must only have letters and numbers.';

module.exports = {
    validateLength,
    invalidLength,
    validateEmail,
    invalidEmail,
    validateUsername,
    invalidUsername,
    validatePassword,
    invalidPassword,
    validateServerNickname,
    invalidServerNickname
};