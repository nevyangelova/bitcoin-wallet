import React from 'react';
import {render, act} from '@testing-library/react';
import '@testing-library/jest-dom';
import {AuthProvider, useAuth} from '../AuthContext';

jest.mock('jsonwebtoken/decode', () => jest.fn());

describe('AuthProvider', () => {
    let jwtDecodeMock;

    beforeEach(() => {
        jwtDecodeMock = require('jsonwebtoken/decode');
        localStorage.clear();
    });

    const TestConsumer = () => {
        const {
            currentUser,
            userData,
            plaidToken,
            setPlaidToken,
            login,
            logout,
        } = useAuth();

        return (
            <div>
                {currentUser && (
                    <div data-testid='currentUser'>{currentUser}</div>
                )}
                {userData && (
                    <div data-testid='userData'>{JSON.stringify(userData)}</div>
                )}
                {plaidToken && <div data-testid='plaidToken'>{plaidToken}</div>}
                <button onClick={() => login('mockToken', {name: 'Test User'})}>
                    Login
                </button>
                <button onClick={() => logout()}>Logout</button>
                <button onClick={() => setPlaidToken('mockPlaidToken')}>
                    Set Plaid Token
                </button>
            </div>
        );
    };

    test('Initial State', () => {
        const {queryByTestId} = render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        expect(queryByTestId('currentUser')).toBeNull();
        expect(queryByTestId('userData')).toBeNull();
        expect(queryByTestId('plaidToken')).toBeNull();
    });

    test('Handle Login', () => {
        const {getByText, queryByTestId} = render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        act(() => {
            getByText('Login').click();
        });

        expect(queryByTestId('currentUser')).toHaveTextContent('mockToken');
        expect(queryByTestId('userData')).toHaveTextContent(
            JSON.stringify({name: 'Test User'})
        );
    });

    test('Handle Logout', () => {
        const {getByText, queryByTestId} = render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        act(() => {
            getByText('Login').click();
        });
        act(() => {
            getByText('Logout').click();
        });

        expect(queryByTestId('currentUser')).toBeNull();
        expect(localStorage.getItem('token')).toBeNull();
    });

    test('Automatic Logout on Token Expiry', () => {
        jwtDecodeMock.mockImplementation(() => ({
            exp: Math.floor(Date.now() / 1000) - 3600,
        })); // Token expired one hour ago

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        expect(localStorage.getItem('token')).toBeNull();
    });

    test('Set Plaid Token', () => {
        const {getByText, queryByTestId} = render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        act(() => {
            getByText('Set Plaid Token').click();
        });

        expect(queryByTestId('plaidToken')).toHaveTextContent('mockPlaidToken');
        expect(localStorage.getItem('plaidAccessToken')).toBe('mockPlaidToken');
    });

    test('Handle Invalid Token', () => {
        localStorage.setItem('token', 'invalidToken');
        jwtDecodeMock.mockImplementation(() => {
            throw new Error('Invalid token');
        });

        const {queryByTestId} = render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        expect(queryByTestId('currentUser')).toBeNull();
        expect(localStorage.getItem('token')).toBeNull();
    });

    test('Preserve State Across Renders', () => {
        const {getByText, rerender, queryByTestId} = render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        act(() => {
            getByText('Login').click();
        });

        rerender(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        expect(queryByTestId('currentUser')).toHaveTextContent('mockToken');
    });
});
