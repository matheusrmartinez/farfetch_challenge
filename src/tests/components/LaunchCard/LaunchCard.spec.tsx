import { render, screen } from '@testing-library/react';
import React from 'react';
import LaunchCard from '../../../components/LaunchCard';
import { Doc, SelectedIcon } from '../../../types';

describe('Launch Card', () => {
  it('renders correctly', () => {
    let doc = {
      links: {
        patch: {
          small: 'https://images2.imgbox.com/3c/0e/T8iJcSN3_o.png',
          alt: 'https://images2.imgbox.com/40/e3/GypSkayF_o.png',
        },
      },
      rocket: '5e9d0d95eda69955f709d1eb',
      success: false,
      flight_number: 1,
      name: 'FalconSat',
      date_utc: '2006-03-24T22:30:00.000Z',
      id: '5eb87cd9ffd86e000604b32a',
      rocket_name: 'Falcon 1',
      year: 2006,
    };

    const isIconSelected = (value: string) => {
      return false;
    };

    const getIconColor = (color: string) => {
      return 'yellow';
    };

    const setSelectedIcons = (
      value: { flightId: '5eb87cd9ffd86e000604b32a'; color: 'yellow' }[],
    ) => {};

    const selectedIcons: SelectedIcon[] = [];

    const handleAddFavoriteData = (value: Doc) => {
    }

    const handleRemoveFavoriteData = (value: string) => {
    }

    render(
      <LaunchCard
        docs={doc}
        isIconSelected={isIconSelected}
        getIconColor={getIconColor}
        setSelectedIcons={setSelectedIcons}
        selectedIcons={selectedIcons}
        handleRemoveFavoriteData={handleRemoveFavoriteData}
        handleAddFavoriteData={handleAddFavoriteData}
      />,
    );
    expect(screen.getByText('Mission: FalconSat')).toBeInTheDocument();
    expect(screen.getByText('2006')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Launch Number: 1')).toBeInTheDocument();
    expect(screen.getByAltText('https://images2.imgbox.com/40/e3/GypSkayF_o.png')).toBeInTheDocument();
    expect(screen.getByText('Rocket: Falcon 1')).toBeInTheDocument();
  });
});
