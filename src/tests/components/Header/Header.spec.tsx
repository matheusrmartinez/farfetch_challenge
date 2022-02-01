import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import Header from '../../../components/Header';

describe('Header', () => {
  it('renders correctly',  () => {
    render(<Header />);
    expect(screen.getByText('SpaceX - Launches')).toBeInTheDocument();
  });
});
