import React, {useEffect, useState} from 'react';
import {Button} from '@mui/material';
import {usePlaidLink} from 'react-plaid-link';
import {useAuth} from '../contexts/AuthContext';
import {createPlaidLinkToken, exchangePublicToken} from '../api/api';

const PlaidButton = () => {
    const [linkToken, setLinkToken] = useState('');
    const {setPlaidToken} = useAuth();

    useEffect(() => {
        const getLinkToken = async () => {
            try {
                const data = await createPlaidLinkToken();
                setLinkToken(data.link_token);
            } catch (error) {
                console.error('Error:', error.message);
            }
        };

        getLinkToken();
    }, []);

    const onSuccess = async (public_token) => {
        try {
            const data = await exchangePublicToken(public_token);
            setPlaidToken(data.access_token);
        } catch (error) {
            console.error('Error:', error.message);
        }
    };

    const config = {
        token: linkToken,
        onSuccess,
    };

    const {open, ready} = usePlaidLink(config);

    return (
        <Button
            onClick={() => open()}
            disabled={!ready}
            variant='contained'
            color='primary'
        >
            Link Bank Account
        </Button>
    );
};

export default PlaidButton;
