export const fetchBitcoinExchangeRate = async () => {
    const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
    );
    const data = await response.json();
    return data.bitcoin.usd;
};

export const fetchBankAndBitcoinDetails = async (authToken) => {
    const headers = {Authorization: `Bearer ${authToken}`};
    const [bitcoinAddressRes, bitcoinBalanceRes, bankRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_BASE_URL}/bitcoin/bitcoin_address`, {headers}),
        fetch(`${process.env.REACT_APP_API_BASE_URL}/bitcoin/bitcoin_balance`, {headers}),
        fetch(`${process.env.REACT_APP_API_BASE_URL}/plaid/fetch_balance`, {headers}),
    ]);

    const bitcoinAddressData = await bitcoinAddressRes.json();
    const bitcoinBalanceData = await bitcoinBalanceRes.json();
    const bankData = await bankRes.json();

    return {bitcoinAddressData, bitcoinBalanceData, bankData};
};

export const purchaseBitcoin = async (
    purchaseAmount,
    usdAmount,
    accountId,
    authToken
) => {
    const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/bitcoin/purchase_bitcoin`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({purchaseAmount, usdAmount, accountId}),
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error purchasing Bitcoin');
    }

    return response.json();
};
export const loginUser = async (credentials) => {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
    }
    return data;
};

export const signupUser = async (userData) => {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Unknown error occurred');
    }
    return data;
};

export const createPlaidLinkToken = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/plaid/create_link_token`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error creating link token');
    }

    return response.json();
};

export const exchangePublicToken = async (publicToken) => {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/plaid/exchange_public_token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ public_token: publicToken }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error exchanging public token');
    }

    return response.json();
};
