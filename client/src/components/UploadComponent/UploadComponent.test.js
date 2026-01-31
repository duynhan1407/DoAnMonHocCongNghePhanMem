import React from 'react';
import { render, screen } from '@testing-library/react';
import { Upload } from '..';

describe('UploadComponent', () => {
  it('renders upload button', () => {
    render(<Upload />);
    expect(screen.getByText(/Tải ảnh lên|Đang tải lên.../i)).toBeInTheDocument();
  });
});
