import React from 'react';
import {render, screen} from '@testing-library/react';
import App from './App';

test("renders Nevy's Quick Wallet header", () => {
    render(<App />);
    const headerElement = screen.getByText(/Nevy's Quick Wallet/i);
    expect(headerElement).toBeInTheDocument();
});
