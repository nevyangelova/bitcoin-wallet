const {getPlaidBalances} = require('../utils/plaidUtils');
const dbQuery = require('../utils/dbQuery');

async function validateUserAndAccount(
    userId,
    accountId,
    usdAmount
) {
    const userRow = await dbQuery(
        `SELECT bitcoin_address, bitcoin_balance FROM users WHERE id = ?`,
        [userId]
    );
    if (!userRow || !userRow.bitcoin_address) {
        throw {statusCode: 404, userMessage: 'Bitcoin address not found.'};
    }

    const accounts = await getPlaidBalances(userId);
    const account = accounts.find((acc) => acc.account_id === accountId);
    if (!account || account.balances.available < usdAmount) {
        throw {
            statusCode: 400,
            userMessage:
                'Insufficient funds in the bank account for this Bitcoin purchase.',
        };
    }

    return {userRow, account};
}

module.exports = {validateUserAndAccount};