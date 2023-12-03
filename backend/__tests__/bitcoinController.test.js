const fetch = require('node-fetch');
const bitcoinClient = require('../config/bitcoinClient');
const dbQuery = require('../utils/dbQuery');
const {
    fetchBitcoinAddress,
    fetchBitcoinBalance,
    purchaseBitcoin,
} = require('../controllers/bitcoinController');
const {validateUserAndAccount} = require('../utils/bitcoinUtils');

jest.mock('../config/bitcoinClient', () => ({
    generateToAddress: jest.fn(),
    setTxFee: jest.fn(),
    sendToAddress: jest.fn().mockResolvedValue('mockTransactionId'),
}));
jest.mock('../utils/dbQuery', () => jest.fn());
jest.mock('node-fetch', () => jest.fn());
jest.mock('../utils/bitcoinUtils', () => ({
    validateUserAndAccount: jest
        .fn()
        .mockResolvedValue({userRow: {bitcoin_address: 'mockBitcoinAddress'}}),
}));

const createMockResponse = () => {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
    };
};
fetch.mockResolvedValue({
    json: () => Promise.resolve({bitcoin: {usd: 10000}}),
});
describe('fetchBitcoinAddress', () => {
    it('successfully fetches Bitcoin address', async () => {
        dbQuery.mockResolvedValue({bitcoin_address: 'mockBitcoinAddress'});

        const req = {user: {userId: 1}};
        const res = createMockResponse();

        await fetchBitcoinAddress(req, res);

        expect(res.json).toHaveBeenCalledWith({
            bitcoinAddress: 'mockBitcoinAddress',
        });
    });

    it('handles user not found error', async () => {
        dbQuery.mockResolvedValue(null);

        const req = {user: {userId: 1}};
        const res = {status: jest.fn().mockReturnThis(), send: jest.fn()};

        await fetchBitcoinAddress(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({
            message: 'Bitcoin address not found.',
        });
    });

    it('handles unexpected database errors', async () => {
        dbQuery.mockRejectedValue(new Error('Database error'));

        const req = {user: {userId: 1}};
        const res = createMockResponse();

        await fetchBitcoinAddress(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({message: expect.any(String)});
    });
});

describe('fetchBitcoinBalance', () => {
    it('successfully fetches Bitcoin balance', async () => {
        dbQuery.mockResolvedValue({bitcoin_balance: 0.5});

        const req = {user: {userId: 1}};
        const res = createMockResponse();

        await fetchBitcoinBalance(req, res);

        expect(res.json).toHaveBeenCalledWith({bitcoinBalance: 0.5});
    });

    it('handles user not found error', async () => {
        dbQuery.mockResolvedValue(null);

        const req = {user: {userId: 1}};
        const res = {status: jest.fn().mockReturnThis(), send: jest.fn()};

        await fetchBitcoinBalance(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({
            message: 'Bitcoin balance not found.',
        });
    });

    it('handles unexpected database errors', async () => {
        dbQuery.mockRejectedValue(new Error('Database error'));

        const req = {user: {userId: 1}};
        const res = createMockResponse();

        await fetchBitcoinBalance(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({message: expect.any(String)});
    });
});

describe('purchaseBitcoin', () => {
    it('successfully purchases Bitcoin', async () => {
        dbQuery.mockResolvedValueOnce({});
        dbQuery.mockResolvedValueOnce({bitcoin_balance: 0});

        const req = {
            user: {userId: 1},
            body: {purchaseAmount: 0.001, accountId: 'mockAccountId'},
        };
        const res = {json: jest.fn()};

        await purchaseBitcoin(req, res);

        expect(bitcoinClient.sendToAddress).toHaveBeenCalledWith(
            'mockBitcoinAddress',
            0.001
        );
        expect(res.json).toHaveBeenCalledWith({
            message: 'Bitcoin purchased successfully',
            transactionId: 'mockTransactionId',
            purchaseAmount: 0.001,
        });
    });

    it('handles insufficient funds error', async () => {
        dbQuery.mockResolvedValueOnce({
            bitcoin_address: 'mockBitcoinAddress',
            bitcoin_balance: 0,
        });
        validateUserAndAccount.mockRejectedValue({
            statusCode: 400,
            userMessage:
                'Insufficient funds in the bank account for this Bitcoin purchase.',
        });

        const req = {
            user: {userId: 1},
            body: {purchaseAmount: 1, accountId: 'mockAccountId'},
        };
        const res = createMockResponse();

        await purchaseBitcoin(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message:
                'Insufficient funds in the bank account for this Bitcoin purchase.',
        });
    });

    it('handles unexpected errors during purchase', async () => {
        dbQuery.mockRejectedValue(new Error('Database error'));

        const req = {
            user: {userId: 1},
            body: {purchaseAmount: 0.001, accountId: 'mockAccountId'},
        };
        const res = createMockResponse();

        await purchaseBitcoin(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({message: expect.any(String)});
    });
});
