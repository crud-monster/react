import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../../app/store';
import Home from './Home';
import { MemoryRouter } from 'react-router-dom';

test('renders learn react link', () => {
  const { getByText } = render(
    <Provider store={store}>
      <MemoryRouter><Home /></MemoryRouter>
    </Provider>
  );

  expect(getByText(/learn/i)).toBeInTheDocument();
});
