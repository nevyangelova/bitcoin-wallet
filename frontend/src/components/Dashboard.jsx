import React, {useState, useEffect, useCallback} from 'react';
import {
    Typography,
    Box,
    Button,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
} from '@mui/material';
import PlaidButton from './PlaidButton';
import {useAuth} from '../contexts/AuthContext';
import {
    fetchBitcoinExchangeRate,
    fetchBankAndBitcoinDetails,
    purchaseBitcoin,
} from '../api/api';
import AccountSelection from './AccountSelection';
import PurchaseForm from './PurchaseForm';

const Dashboard = () => {
    const {userData, plaidToken, logout} = useAuth();
    const [bankAccounts, setBankAccounts] = useState([]);
    const [bitcoinAddress, setBitcoinAddress] = useState('');
    const [bitcoinBalance, setBitcoinBalance] = useState('');
    const [selectedAccount, setSelectedAccount] = useState('');
    const [purchaseAmount, setPurchaseAmount] = useState('');
    const [bitcoinExchangeRate, setBitcoinExchangeRate] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isPurchaseLoading, setIsPurchaseLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const {bitcoinAddressData, bitcoinBalanceData, bankData} =
                    await fetchBankAndBitcoinDetails(
                        localStorage.getItem('token')
                    );
                setBitcoinAddress(bitcoinAddressData.bitcoinAddress);
                setBitcoinBalance(bitcoinBalanceData.bitcoinBalance);
                setBankAccounts(bankData);
                const rate = await fetchBitcoinExchangeRate();
                setBitcoinExchangeRate(rate);
            } catch (error) {
                console.error('Error fetching details:', error);
                setError(error.message || 'Failed to fetch details');
            } finally {
                setIsLoading(false);
            }
        };

        if (plaidToken && plaidToken !== 'null') {
            fetchData();
        }
    }, [plaidToken]);

    const setHalfMaxPurchaseAmount = useCallback(
        (multiplier) => {
            if (!selectedAccount) {
                setError('Please select an account');
                return;
            }
            if (
                bankAccounts &&
                bankAccounts.length > 0 &&
                selectedAccount &&
                bitcoinExchangeRate
            ) {
                const selectedBankAccount = bankAccounts.find(
                    (account) => account.account_id === selectedAccount
                );
                if (selectedBankAccount) {
                    const maxBitcoinPurchase =
                        (selectedBankAccount.balances.available /
                            bitcoinExchangeRate) *
                        multiplier;
                    setPurchaseAmount(maxBitcoinPurchase.toFixed(8)); // Set to 8 decimal places for Bitcoin
                    setError('');
                }
            }
        },
        [bankAccounts, bitcoinExchangeRate, selectedAccount]
    );

    const handlePurchaseAmountChange = useCallback(
        (e) => {
            if (!selectedAccount) {
                setError('Please select an account');
                return;
            }
            const amount = e.target.value;
            if (selectedAccount && bitcoinExchangeRate) {
                const selectedBankAccount = bankAccounts.find(
                    (account) => account.account_id === selectedAccount
                );
                if (
                    selectedBankAccount &&
                    amount * bitcoinExchangeRate >
                        selectedBankAccount.balances.available
                ) {
                    setError('Insufficient balance for this amount of Bitcoin');
                } else {
                    setError('');
                }
            }
            setPurchaseAmount(amount);
        },
        [selectedAccount, bitcoinExchangeRate, bankAccounts]
    );

    const handlePurchase = useCallback(
        async (e) => {
            e.preventDefault();
            const usdAmount = purchaseAmount * bitcoinExchangeRate;
            setIsPurchaseLoading(true);
            try {
                await purchaseBitcoin(
                    purchaseAmount,
                    usdAmount,
                    selectedAccount,
                    localStorage.getItem('token')
                );
                const newBalance =
                    parseFloat(bitcoinBalance) + parseFloat(purchaseAmount);
                setMessage('Purchase successful!');
                setBitcoinBalance(newBalance.toString());
            } catch (error) {
                setError(error.message || 'Purchase error');
            } finally {
                setIsPurchaseLoading(false);
            }
        },
        [purchaseAmount, bitcoinExchangeRate, selectedAccount, bitcoinBalance]
    );

    const handleAccountSelectionChange = useCallback((event) => {
        setSelectedAccount(event.target.value);
    }, []);

    return (
        <Box
            sx={{
                maxWidth: 600,
                mx: 'auto',
                my: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'normal',
            }}
        >
            <Typography variant='h4' gutterBottom textAlign={'center'}>
                Welcome, {userData && userData.name}
            </Typography>
            {!plaidToken || plaidToken === 'null' ? (
                <PlaidButton />
            ) : (
                <>
                    {isLoading ? (
                        <CircularProgress />
                    ) : (
                        <>
                            <Typography variant='h6'>
                                Wallet Address: {bitcoinAddress}
                            </Typography>
                            <Typography variant='h6'>
                                Bitcoin Balance: {bitcoinBalance} BTC
                            </Typography>
                            <Box my={2}>
                                <Typography variant='h6'>
                                    Bank Accounts:
                                </Typography>
                                <List>
                                    {bankAccounts &&
                                        bankAccounts.length > 0 &&
                                        bankAccounts.map((account) => (
                                            <ListItem key={account.account_id}>
                                                <ListItemText
                                                    primary={`${account.name} (${account.official_name})`}
                                                    secondary={`Available Balance: $${account.balances.available}, Current Balance: $${account.balances.current}`}
                                                />
                                            </ListItem>
                                        ))}
                                </List>
                            </Box>
                            <AccountSelection
                                accounts={bankAccounts}
                                selectedAccount={selectedAccount}
                                onSelectAccount={handleAccountSelectionChange}
                            />
                            <PurchaseForm
                                purchaseAmount={purchaseAmount}
                                onPurchaseAmountChange={
                                    handlePurchaseAmountChange
                                }
                                onHalfMaxPurchaseAmount={
                                    setHalfMaxPurchaseAmount
                                }
                                onMaxPurchaseAmount={setHalfMaxPurchaseAmount}
                                onPurchase={handlePurchase}
                                error={error}
                                isLoading={isPurchaseLoading}
                            />
                            {message && (
                                <Typography color='textSecondary'>
                                    {message}
                                </Typography>
                            )}
                        </>
                    )}
                </>
            )}
            <Button
                onClick={logout}
                variant='contained'
                color='secondary'
                sx={{mt: 2}}
                disabled={isLoading}
            >
                {isLoading ? <CircularProgress size={24} /> : 'Log Out'}
            </Button>
        </Box>
    );
};
export default Dashboard;
