import React from 'react';
import { Select, MenuItem } from '@mui/material';

const AccountSelection = ({ accounts, selectedAccount, onSelectAccount }) => {
    console.log(accounts);
    return (
        <Select
            fullWidth
            value={selectedAccount}
            onChange={onSelectAccount}
            displayEmpty
            inputProps={{ 'aria-label': 'Select Bank Account' }}
        >
            <MenuItem value=''>Select an Account</MenuItem>
            {accounts.map((account) => (
                <MenuItem key={account.account_id} value={account.account_id}>
                    {account.name} - Available: ${account.balances.available}
                </MenuItem>
            ))}
        </Select>
    );
};

export default React.memo(AccountSelection);
