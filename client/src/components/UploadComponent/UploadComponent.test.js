import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UploadComponent from '../UploadComponent/UploadComponent';

describe('UploadComponent', () => {
  it('renders upload button and input', () => {
    render(<UploadComponent />);
    expect(screen.getByText(/Upload a File/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/file/i)).toBeInTheDocument();
  });
});
