const plaidClient = require('../config/plaidClient');
const bitcoinClient = require('../config/bitcoinClient');
const dbQuery = require('../utils/dbQuery');
const {getPlaidBalances} = require('../utils/plaidUtils');
const {
    createLinkToken,
    exchangePublicToken,
    fetchBalance,
} = require('../controllers/plaidController');
const handleError = require('../utils/errorHandler');

jest.mock('../config/plaidClient', () => ({
    linkTokenCreate: jest.fn(),
    itemPublicTokenExchange: jest.fn(),
}));
jest.mock('../config/bitcoinClient', () => ({
    loadWallet: jest.fn(),
    createWallet: jest.fn(),
    getNewAddress: jest.fn().mockResolvedValue('mockNewBitcoinAddress'),
}));
jest.mock('../utils/dbQuery', () => jest.fn());
jest.mock('../utils/plaidUtils', () => ({
    getPlaidBalances: jest.fn(),
}));
jest.mock('../utils/errorHandler', () => jest.fn());

const createMockResponse = () => {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
    };
};
describe('createLinkToken', () => {
    it('successfully creates a link token', async () => {
        const linkTokenCreateMock =
            plaidClient.linkTokenCreate.mockResolvedValue({
                data: {link_token: 'mockLinkToken'},
            });

        const req = {user: {userId: 123}};
        const res = createMockResponse();

        await createLinkToken(req, res);

        expect(linkTokenCreateMock).toHaveBeenCalledWith(expect.any(Object));
        expect(res.json).toHaveBeenCalledWith({link_token: 'mockLinkToken'});
    });

    it('handles errors during link token creation', async () => {
        plaidClient.linkTokenCreate.mockRejectedValue(
            new Error('Link token creation failed')
        );

        const req = {user: {userId: 123}};
        const res = createMockResponse();

        await createLinkToken(req, res);

        expect(handleError).toHaveBeenCalledWith(
            res,
            expect.any(Error),
            'Error creating link token'
        );
    });
});

describe('exchangePublicToken', () => {
    it('successfully exchanges public token', async () => {
        plaidClient.itemPublicTokenExchange.mockResolvedValue({
            data: {access_token: 'mockAccessToken'},
        });
        bitcoinClient.getNewAddress.mockResolvedValue('mockBitcoinAddress');
        dbQuery.mockResolvedValueOnce({});
        dbQuery.mockResolvedValueOnce({});

        const req = {
            body: {public_token: 'mockPublicToken'},
            user: {userId: 123},
        };
        const res = createMockResponse();

        await exchangePublicToken(req, res);

        expect(res.json).toHaveBeenCalledWith({
            access_token: 'mockAccessToken',
            bitcoinAddress: 'mockBitcoinAddress',
        });
    });

    it('handles errors during public token exchange', async () => {
        plaidClient.itemPublicTokenExchange.mockRejectedValue(
            new Error('Token exchange failed')
        );

        const req = {
            body: {public_token: 'mockPublicToken'},
            user: {userId: 123},
        };
        const res = createMockResponse();

        await exchangePublicToken(req, res);

        expect(handleError).toHaveBeenCalledWith(
            res,
            expect.any(Error),
            'Error exchanging public token'
        );
    });
});

describe('fetchBalance', () => {
    it('successfully fetches balance', async () => {
        const mockAccountData = [
            {
                account_id: 'mockAccountId1',
                balances: {
                    available: 1000,
                    current: 1200,
                },
            },
            {
                account_id: 'mockAccountId2',
                balances: {
                    available: 500,
                    current: 600,
                },
            },
        ];
        getPlaidBalances.mockResolvedValue(mockAccountData);

        const req = {user: {userId: 123}};
        const res = createMockResponse();

        await fetchBalance(req, res);

        expect(getPlaidBalances).toHaveBeenCalledWith(123);
        expect(res.json).toHaveBeenCalledWith(mockAccountData);
    });

    it('handles errors during balance fetching', async () => {
        getPlaidBalances.mockRejectedValue(
            new Error('Balance fetching failed')
        );

        const req = {user: {userId: 123}};
        const res = createMockResponse();

        await fetchBalance(req, res);

        expect(handleError).toHaveBeenCalledWith(
            res,
            expect.any(Error),
            'Error fetching balance'
        );
    });
});
