const Client = require('bitcoin-core');

const client = new Client({
    network: 'regtest',
    username: 'nevytest',
    password: '1234',
    port: 18443,
    wallet: 'wallet_1',
});

module.exports = client;
