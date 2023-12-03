import React, {lazy} from 'react';
import {Route, Routes, Navigate} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';

const Signup = lazy(() => import('../components/Signup'));
const Login = lazy(() => import('../components/Login'));
const Dashboard = lazy(() => import('../components/Dashboard'));

const AppRoutes = () => {
    const {currentUser} = useAuth();

    return (
        <Routes>
            <Route
                path='/'
                element={
                    currentUser ? (
                        <Navigate to='/dashboard' />
                    ) : (
                        <Navigate to='/login' />
                    )
                }
            />
            <Route
                path='/signup'
                element={
                    currentUser ? <Navigate to='/dashboard' /> : <Signup />
                }
            />
            <Route
                path='/login'
                element={currentUser ? <Navigate to='/dashboard' /> : <Login />}
            />
            <Route
                path='/dashboard'
                element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                }
            />
        </Routes>
    );
};

const PrivateRoute = ({children, ...rest}) => {
    const {currentUser} = useAuth();
    return currentUser ? children : <Navigate to='/login' />;
};

export default AppRoutes;
