import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';
import {TextField, Button, Typography, Box} from '@mui/material';
import {signupUser} from '../api/api';

const Signup = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const {login} = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const data = await signupUser(formData);
            login(data.token, data.user);
            setMessage(data.message);
            navigate('/dashboard');
        } catch (networkError) {
            setMessage('Network error occurred. Please try again.');
        }
    };

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    return (
        <Box sx={{maxWidth: 400, mx: 'auto', my: 2}}>
            <Typography variant='h4' gutterBottom>
                Sign Up
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
                <TextField
                    label='Name'
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    margin='normal'
                    fullWidth
                    required
                />
                {message && <Typography color='textSecondary'>{message}</Typography>}
                <Button
                    type='submit'
                    variant='contained'
                    color='primary'
                    sx={{mt: 2}}
                >
                    Sign Up
                </Button>
            </form>
        </Box>
    );
};

export default Signup;
