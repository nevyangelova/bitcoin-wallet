const express = require('express');
const plaidRouter = express.Router();
const plaidController = require('../controllers/plaidController');
const authenticateToken = require('../middleware/authenticateToken');

plaidRouter.post(
    '/create_link_token',
    authenticateToken,
    plaidController.createLinkToken
);
plaidRouter.post(
    '/exchange_public_token',
    authenticateToken,
    plaidController.exchangePublicToken
);
plaidRouter.get('/fetch_balance', authenticateToken, plaidController.fetchBalance);

module.exports = plaidRouter;
