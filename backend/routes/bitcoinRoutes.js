const express = require('express');
const bitcoinRouter = express.Router();
const bitcoinController = require('../controllers/bitcoinController');
const authenticateToken = require('../middleware/authenticateToken');

bitcoinRouter.post(
    '/purchase_bitcoin',
    authenticateToken,
    bitcoinController.purchaseBitcoin
);

bitcoinRouter.get(
    '/bitcoin_address',
    authenticateToken,
    bitcoinController.fetchBitcoinAddress
);

bitcoinRouter.get(
    '/bitcoin_balance',
    authenticateToken,
    bitcoinController.fetchBitcoinBalance
);

module.exports = bitcoinRouter;
