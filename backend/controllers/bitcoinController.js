const bitcoinClient = require('../config/bitcoinClient');
const dbQuery = require('../utils/dbQuery');
const handleError = require('../utils/errorHandler');
const fetch = require('node-fetch');
const {validateUserAndAccount} = require('../utils/bitcoinUtils');

const getBitcoinExchangeRate = async () => {
    try {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
        );
        const data = await response.json();
        return data.bitcoin.usd;
    } catch (error) {
        console.error('Error fetching Bitcoin exchange rate:', error);
        throw error;
    }
};

exports.fetchBitcoinAddress = async (req, res) => {
    const userId = req.user.userId;
    try {
        const userRow = await dbQuery(
            `SELECT bitcoin_address FROM users WHERE id = ?`,
            [userId]
        );
        if (!userRow) {
            return res
                .status(404)
                .send({message: 'Bitcoin address not found.'});
        }
        res.json({bitcoinAddress: userRow.bitcoin_address});
    } catch (error) {
        handleError(res, error, 'Error fetching Bitcoin address');
    }
};

exports.fetchBitcoinBalance = async (req, res) => {
    const userId = req.user.userId;
    try {
        const userRow = await dbQuery(
            `SELECT bitcoin_balance FROM users WHERE id = ?`,
            [userId]
        );
        if (!userRow) {
            return res
                .status(404)
                .send({message: 'Bitcoin balance not found.'});
        }
        res.json({bitcoinBalance: userRow.bitcoin_balance || 0});
    } catch (error) {
        handleError(res, error, 'Error fetching Bitcoin balance');
    }
};

exports.purchaseBitcoin = async (req, res) => {
    const userId = req.user.userId;
    const {purchaseAmount, accountId} = req.body;
    try {
        const exchangeRate = await getBitcoinExchangeRate();
        const usdAmount = purchaseAmount * exchangeRate;
        const {userRow} = await validateUserAndAccount(
            userId,
            accountId,
            purchaseAmount,
            usdAmount
        );

        await bitcoinClient.generateToAddress(1, userRow.bitcoin_address);

        // Set transaction fee and send Bitcoin
        const feeRate = 0.00001;
        await bitcoinClient.setTxFee(feeRate);
        const transactionId = await bitcoinClient.sendToAddress(
            userRow.bitcoin_address,
            purchaseAmount
        );
        // Update user's Bitcoin balance in the database
        await dbQuery(
            `UPDATE users SET bitcoin_balance = bitcoin_balance + ? WHERE id = ?`,
            [purchaseAmount, userId]
        );

        res.json({
            message: 'Bitcoin purchased successfully',
            transactionId,
            purchaseAmount,
        });
    } catch (error) {
        handleError(res, error, 'Error purchasing Bitcoin');
    }
};
