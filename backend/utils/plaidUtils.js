const plaidClient = require('../config/plaidClient');
const db = require('../utils/database');

async function getPlaidBalances(userId) {
    const user = await new Promise((resolve, reject) => {
        db.get(
            `SELECT plaid_access_token FROM users WHERE id = ?`,
            [userId],
            (err, row) => {
                if (err) reject(err);
                resolve(row);
            }
        );
    });

    if (!user || !user.plaid_access_token) {
        throw new Error('Access token not found for user.');
    }

    const balanceResponse = await plaidClient.accountsBalanceGet({
        access_token: user.plaid_access_token,
    });

    return balanceResponse.data.accounts;
}

module.exports = {getPlaidBalances};
