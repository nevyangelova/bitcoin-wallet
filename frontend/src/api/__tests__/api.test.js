import {
    fetchBitcoinExchangeRate,
    fetchBankAndBitcoinDetails,
    purchaseBitcoin,
    loginUser,
    signupUser,
    createPlaidLinkToken,
    exchangePublicToken,
} from '../api';

const mockGetItem = jest.fn();
global.localStorage = {
    getItem: mockGetItem,
};
const mockAuthHeader = {Authorization: `Bearer fakeToken`};

describe('API Functions', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('fetchBitcoinExchangeRate', () => {
        it('should fetch the Bitcoin exchange rate', async () => {
            global.fetch.mockResolvedValueOnce({
                json: () => Promise.resolve({bitcoin: {usd: 20000}}),
            });

            const rate = await fetchBitcoinExchangeRate();
            expect(rate).toBe(20000);
            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
            );
        });

        it('handles fetch error', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Fetch error'));
            await expect(fetchBitcoinExchangeRate()).rejects.toThrow(
                'Fetch error'
            );
        });
    });

    describe('fetchBankAndBitcoinDetails', () => {
        it('should fetch bank and bitcoin details', async () => {
            const mockResponse = {
                bitcoinAddressData: {bitcoinAddress: 'abc123'},
                bitcoinBalanceData: {bitcoinBalance: 5},
                bankData: [{id: 1, name: 'Test Bank'}],
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse.bitcoinAddressData),
            });
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse.bitcoinBalanceData),
            });
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse.bankData),
            });

            const details = await fetchBankAndBitcoinDetails('fakeToken');
            expect(details).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith(
                `${process.env.REACT_APP_API_BASE_URL}/bitcoin/bitcoin_address`,
                {headers: mockAuthHeader}
            );
            expect(global.fetch).toHaveBeenCalledWith(
                `${process.env.REACT_APP_API_BASE_URL}/bitcoin/bitcoin_balance`,
                {headers: mockAuthHeader}
            );
            expect(global.fetch).toHaveBeenCalledWith(
                `${process.env.REACT_APP_API_BASE_URL}/plaid/fetch_balance`,
                {headers: mockAuthHeader}
            );
        });

        it('handles error when fetching bitcoin address data', async () => {
            global.fetch.mockRejectedValueOnce(
                new Error('Failed to fetch bitcoin address')
            );
            await expect(
                fetchBankAndBitcoinDetails('fakeToken')
            ).rejects.toThrow('Failed to fetch bitcoin address');
        });

        it('handles error when fetching bitcoin balance data', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({bitcoinAddress: 'abc123'}),
            });
            global.fetch.mockRejectedValueOnce(
                new Error('Failed to fetch bitcoin balance')
            );
            await expect(
                fetchBankAndBitcoinDetails('fakeToken')
            ).rejects.toThrow('Failed to fetch bitcoin balance');
        });

        it('handles error when fetching bank data', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({bitcoinAddress: 'abc123'}),
            });
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({bitcoinBalance: 5}),
            });
            global.fetch.mockRejectedValueOnce(
                new Error('Failed to fetch bank data')
            );
            await expect(
                fetchBankAndBitcoinDetails('fakeToken')
            ).rejects.toThrow('Failed to fetch bank data');
        });
    });

    describe('purchaseBitcoin', () => {
        const purchaseData = {
            purchaseAmount: 1,
            usdAmount: 20000,
            accountId: 'acc123',
        };

        it('successfully purchases bitcoin', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({success: true}),
            });

            const response = await purchaseBitcoin(
                purchaseData.purchaseAmount,
                purchaseData.usdAmount,
                purchaseData.accountId,
                'fakeToken'
            );
            expect(response).toEqual({success: true});
            expect(global.fetch).toHaveBeenCalledWith(
                `${process.env.REACT_APP_API_BASE_URL}/bitcoin/purchase_bitcoin`,
                expect.anything()
            );
        });

        it('handles purchase error', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Purchase error'));
            await expect(
                purchaseBitcoin(
                    purchaseData.purchaseAmount,
                    purchaseData.usdAmount,
                    purchaseData.accountId,
                    'fakeToken'
                )
            ).rejects.toThrow('Purchase error');
        });
    });

    describe('loginUser', () => {
        const credentials = {
            email: 'test@example.com',
            password: 'password123',
        };

        it('logs in user successfully', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        token: 'authToken',
                        user: {name: 'Test User'},
                    }),
            });

            const response = await loginUser(credentials);
            expect(response).toEqual({
                token: 'authToken',
                user: {name: 'Test User'},
            });
            expect(global.fetch).toHaveBeenCalledWith(
                `${process.env.REACT_APP_API_BASE_URL}/auth/login`,
                expect.anything()
            );
        });

        it('handles login error', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Login error'));
            await expect(loginUser(credentials)).rejects.toThrow('Login error');
        });
    });

    describe('signupUser', () => {
        const userData = {
            email: 'newuser@example.com',
            password: 'newpassword',
            name: 'New User',
        };

        it('signs up user successfully', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({message: 'User created'}),
            });

            const response = await signupUser(userData);
            expect(response).toEqual({message: 'User created'});
            expect(global.fetch).toHaveBeenCalledWith(
                `${process.env.REACT_APP_API_BASE_URL}/auth/signup`,
                expect.anything()
            );
        });

        it('handles signup error', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Signup error'));
            await expect(signupUser(userData)).rejects.toThrow('Signup error');
        });
    });

    describe('createPlaidLinkToken', () => {
        it('creates a Plaid link token successfully', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({link_token: 'plaidLinkToken'}),
            });

            const response = await createPlaidLinkToken();
            expect(response).toEqual({link_token: 'plaidLinkToken'});
            expect(global.fetch).toHaveBeenCalledWith(
                `${process.env.REACT_APP_API_BASE_URL}/plaid/create_link_token`,
                expect.anything()
            );
        });

        it('handles error in creating Plaid link token', async () => {
            global.fetch.mockRejectedValueOnce(
                new Error('Plaid link token error')
            );
            await expect(createPlaidLinkToken()).rejects.toThrow(
                'Plaid link token error'
            );
        });
    });

    describe('exchangePublicToken', () => {
        const publicToken = 'publicToken123';

        it('exchanges public token successfully', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({access_token: 'accessToken123'}),
            });

            const response = await exchangePublicToken(publicToken);
            expect(response).toEqual({access_token: 'accessToken123'});
            expect(global.fetch).toHaveBeenCalledWith(
                `${process.env.REACT_APP_API_BASE_URL}/plaid/exchange_public_token`,
                expect.anything()
            );
        });

        it('handles error in exchanging public token', async () => {
            global.fetch.mockRejectedValueOnce(
                new Error('Public token exchange error')
            );
            await expect(exchangePublicToken(publicToken)).rejects.toThrow(
                'Public token exchange error'
            );
        });
    });
});
