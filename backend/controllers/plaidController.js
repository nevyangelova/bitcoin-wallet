const plaidClient = require('../config/plaidClient');
const dbQuery = require('../utils/dbQuery');
const handleError = require('../utils/errorHandler');
const bitcoinClient = require('../config/bitcoinClient');
const {getPlaidBalances} = require('../utils/plaidUtils');

exports.createLinkToken = async (req, res) => {
    const userId = req.user.userId;
    try {
        const response = await plaidClient.linkTokenCreate({
            user: {
                client_user_id: userId.toString(),
            },
            client_name: 'Nevy Wallets',
            products: ['auth', 'transactions'],
            country_codes: ['US'],
            language: 'en',
        });
        res.json({link_token: response.data.link_token});
    } catch (error) {
        handleError(res, error, 'Error creating link token');
    }
};

exports.exchangePublicToken = async (req, res) => {
    const {public_token} = req.body;
    const userId = req.user.userId;

    try {
        const exchangeResponse = await plaidClient.itemPublicTokenExchange({
            public_token,
        });
        const access_token = exchangeResponse.data.access_token;

        await dbQuery(`UPDATE users SET plaid_access_token = ? WHERE id = ?`, [
            access_token,
            userId,
        ]);

        const walletName = `wallet_${userId}`;
        try {
            await bitcoinClient.loadWallet(walletName);
        } catch (loadError) {
            if (loadError.message.includes('does not exist')) {
                await bitcoinClient.createWallet(walletName);
                await bitcoinClient.loadWallet(walletName);
            } else if (!loadError.message.includes('already loaded')) {
                return handleError(res, loadError, 'Error loading wallet');
            }
            // If the wallet is already loaded, proceed without re-loading
        }

        const newAddress = await bitcoinClient.getNewAddress();
        await dbQuery(`UPDATE users SET bitcoin_address = ? WHERE id = ?`, [
            newAddress,
            userId,
        ]);
        res.json({access_token, bitcoinAddress: newAddress});
    } catch (error) {
        handleError(res, error, 'Error exchanging public token');
    }
};

exports.fetchBalance = async (req, res) => {
    const userId = req.user.userId;
    try {
        const accounts = await getPlaidBalances(userId);
        res.json(accounts);
    } catch (error) {
        handleError(res, error, 'Error fetching balance');
    }
};
