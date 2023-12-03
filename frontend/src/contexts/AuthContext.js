import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
    useCallback,
} from 'react';
import jwtDecode from 'jsonwebtoken/decode';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({children}) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [plaidToken, setPlaidTokenState] = useState(
        localStorage.getItem('plaidAccessToken')
    );

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                console.log('Decoded Token:', decodedToken);

                if (decodedToken.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setCurrentUser(token);
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                logout();
            }
        }
    }, []);

    const login = useCallback((token, userData) => {
        localStorage.setItem('token', token);
        setCurrentUser(token);
        setUserData(userData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('plaidAccessToken');
        setCurrentUser(null);
        setPlaidToken(null);
    }, []);

    const setPlaidToken = useCallback((token) => {
        localStorage.setItem('plaidAccessToken', token);
        setPlaidTokenState(token);
    }, []);

    const value = useMemo(
        () => ({
            currentUser,
            userData,
            plaidToken,
            setPlaidToken,
            login,
            logout,
        }),
        [currentUser, userData, plaidToken, logout, setPlaidToken, login]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
