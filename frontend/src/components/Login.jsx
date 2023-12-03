import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';
import { loginUser } from '../api/api';
import {TextField, Button, Typography, Box} from '@mui/material';

const Login = () => {
    const {login} = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const data = await loginUser(formData);
            login(data.token, data.user);
            setMessage(data.message);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error:', error);
            setMessage('Network error occurred.');
        }
    };

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    return (
        <Box sx={{maxWidth: 400, mx: 'auto', my: 2}}>
            <Typography variant='h4' gutterBottom>
                Login
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label='Email'
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    margin='normal'
                    fullWidth
                    required
                />
                <TextField
                    label='Password'
                    type='password'
                    name='password'
                    value={formData.password}
                    onChange={handleChange}
                    margin='normal'
                    fullWidth
                    required
                />
                {message && (
                    <Typography color='textSecondary'>{message}</Typography>
                )}
                <Button
                    type='submit'
                    variant='contained'
                    color='primary'
                    sx={{mt: 2}}
                >
                    Login
                </Button>
            </form>
        </Box>
    );
};

export default Login;
