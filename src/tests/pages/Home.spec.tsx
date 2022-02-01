import { cleanup, render, screen, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import Home from '../../pages';
import { api } from '../../services/api';

const mock = new MockAdapter(api, { onNoMatch: 'throwException' });

afterEach(cleanup);

// jest.mock('axios');

// const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Home page', () => {
  it('renders correctly', async () => {
    mock.onPost('/launches/query').reply(200, { docs: [] });

    await waitFor(() => render(<Home />));

    expect(screen.getByLabelText('Past')).toBeInTheDocument();
    expect(screen.getByLabelText('Upcoming')).toBeInTheDocument();
    expect(screen.getByLabelText('Favorites')).toBeInTheDocument();
  });

  it('fetch data correclty', async () => {
    let mockedData = {
      docs: [
        {
          links: {
            patch: {
              small: 'https://images2.imgbox.com/3c/0e/T8iJcSN3_o.png',
              large: 'https://images2.imgbox.com/40/e3/GypSkayF_o.png',
            },
          },
          rocket: '5e9d0d95eda69955f709d1eb',
          success: false,
          flight_number: 1,
          name: 'FalconSat 1',
          date_utc: '2006-03-24T22:30:00.000Z',
          id: '5eb87cd9ffd86e000604b32a',
          rocket_name: 'Falcon 1',
          alt: 'FalconSat logo',
          year: 2006,
        },
        {
          links: {
            patch: {
              small: 'https://images2.imgbox.com/3c/0e/T8iJcSN3_o.png',
              large: 'https://images2.imgbox.com/40/e3/GypSkayF_o.png',
            },
          },
          rocket: '5e9d0d95eda69955f709d1eb',
          success: false,
          flight_number: 1,
          name: 'FalconSat 2',
          date_utc: '2006-03-24T22:30:00.000Z',
          id: '5eb87cd9ffd86e000604b32c',
          rocket_name: 'Falcon 2',
          alt: 'FalconSat logo',
          year: 2007,
        },
      ],
      hasNextPage: true,
    };

    mock.onGet('/launches/5eb87cd9ffd86e000604b32c').reply(200, {docs: []})
    mock.onGet('/rockets/5e9d0d95eda69955f709d1eb').reply(200, {name: 'aaa' })
    mock.onPost('/launches/query').reply(200, mockedData);
    await waitFor(() => render(<Home />));
    expect(screen.getAllByText('Mission: FalconSat 1')[0]).toBeInTheDocument();
  });
});
