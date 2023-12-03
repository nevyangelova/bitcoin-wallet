import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import {Typography} from '@mui/material';
import {AuthProvider} from '../src/contexts/AuthContext';
import AppRoutes from '../src/routes/AppRoutes';

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className='App'>
                    <Typography variant='h2' gutterBottom align='center'>
                        Nevy's Quick Wallet
                    </Typography>{' '}
                    <AppRoutes />
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
