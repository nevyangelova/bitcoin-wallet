import React from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    CircularProgress,
} from '@mui/material';

const PurchaseForm = ({
    purchaseAmount,
    onPurchaseAmountChange,
    onHalfMaxPurchaseAmount,
    onMaxPurchaseAmount,
    onPurchase,
    error,
    isLoading,
}) => {
    return (
        <Box component='form' onSubmit={onPurchase} noValidate sx={{mt: 1}}>
            <TextField
                fullWidth
                type='number'
                label='Amount to Purchase'
                value={purchaseAmount}
                onChange={onPurchaseAmountChange}
                margin='normal'
                required
            />

            <Button
                type='button'
                sx={{mt: 1, mr: 1}}
                variant='contained'
                onClick={() => onHalfMaxPurchaseAmount(0.5)}
            >
                Half
            </Button>
            <Button
                type='button'
                sx={{mt: 1, mr: 1}}
                variant='contained'
                onClick={() => onMaxPurchaseAmount(1)}
            >
                Max
            </Button>
            <Button
                type='submit'
                sx={{mt: 1, mr: 1}}
                variant='contained'
                color='primary'
                disabled={isLoading}
            >
                {isLoading ? (
                    <CircularProgress size={24} />
                ) : (
                    'Purchase Bitcoin'
                )}{' '}
            </Button>

            {error && (
                <Typography color='error' variant='body2' sx={{mt: 2}}>
                    {error}
                </Typography>
            )}
        </Box>
    );
};

export default React.memo(PurchaseForm);
