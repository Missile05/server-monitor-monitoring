const crypto = require('crypto');
const moment = require('moment/moment');
const { default: links } = require('./links');

const { config: { errorLogs } } = require('./config');

const generateRandomNumber = (length) => {
    const number = [...Array(length - 1)].map(() => `0`).join('');

    const minimum = parseInt(`1${number}`);
    const maximum = parseInt(`${length}${number}`);

    return Math.floor(minimum + Math.random() * maximum);
};

const seperateNumber = (number, seperator) => {
    const numberString = number?.toString();
    const length = numberString?.length;

    return `${numberString.slice(0, (length / 2))}${seperator}${numberString.slice((length / 2))}`;
};

const hashPassword = (password, salt) => {
    const hashedSalt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto.pbkdf2Sync(password, salt ?? hashedSalt, 1000, 64, 'sha512').toString('hex');

    return { hashedPassword, hashedSalt };
};

const logError = (err) => errorLogs ? (err?.message ?? err) : 'Unexpected API/Database error, try again.';

const daysUntil = (date) => moment(date).diff(moment(), 'days') ?? 0;

const addToDate = (date, ...time) => new Date(moment(date === 'now' ? moment.now() : date).add(...time).format('YYYY-MM-DDTHH:mm:ss[Z]'));

const apiRequest = (url, method, body, setState, set, callback, callbackOnSuccess) => {
    if (setState) setState({ errors: [], elementsDisabled: true, ...(set ? { [set]: false } : {}) });

    fetch(url, { method, ...(body ? { body: JSON.stringify(body) } : {}) })
        .then(async (res) => {
            const { data, errors } = await res?.json();

            if (setState) setState({ elementsDisabled: false, errors, ...(set ? { [set]: data?.success } : {}) });
            if (callback && (callbackOnSuccess ? (callbackOnSuccess && data?.success) : true)) callback(data);
        })
        .catch(() => setState && setState({ elementsDisabled: false, errors: ['API error, try again.'] }));
};

const setUser = (setState, router, link, callback) => apiRequest(links.api.user.default, 'GET', null, null, null, (data) => {
    if (setState && data?.user) setState({ user: data?.user });
    else if (router && link) router.push(link);

    if (callback) callback(data?.user);
});

const logout = (Router) => apiRequest(links.api.user.logout, 'POST', null, null, null, () => Router.push(links.login));

const parseJson = (json) => {
    try { return JSON.parse(json); }
    catch { return {} };
};

const getBody = (body) => typeof body === 'object'
    ? body
    : parseJson(body);

module.exports = {
    generateRandomNumber,
    seperateNumber,
    hashPassword,
    logError,
    daysUntil,
    addToDate,
    apiRequest,
    setUser,
    logout,
    parseJson,
    getBody
};