import React from 'react';
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from './app/store';
import App from './App';

test('renders the public home page under React Strict Mode', () => {
  render(
    <React.StrictMode>
      <Provider store={store}>
        <MockedProvider>
          <MemoryRouter initialEntries={['/']}>
            <App />
          </MemoryRouter>
        </MockedProvider>
      </Provider>
    </React.StrictMode>
  );

  expect(screen.getByRole('heading', { name: 'CRUD Monster React' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login');
});
