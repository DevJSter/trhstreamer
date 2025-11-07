import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MagnetInputForm from '../../src/app/components/MagnetInputForm';

describe('MagnetInputForm', () => {
  it('renders the form with input and submit button', () => {
    const mockOnSubmit = jest.fn();
    render(<MagnetInputForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/Magnet Link or HLS Playlist URL/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Stream/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Paste/i })).toBeInTheDocument();
  });

  it('displays error for invalid magnet link', async () => {
    const mockOnSubmit = jest.fn();
    render(<MagnetInputForm onSubmit={mockOnSubmit} />);

    const input = screen.getByLabelText(/Magnet Link or HLS Playlist URL/i);
    const submitButton = screen.getByRole('button', { name: /Stream/i });

    fireEvent.change(input, { target: { value: 'invalid-link' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /Please enter a valid magnet link/i
      );
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('accepts valid magnet link', async () => {
    const mockOnSubmit = jest.fn();
    render(<MagnetInputForm onSubmit={mockOnSubmit} />);

    const input = screen.getByLabelText(/Magnet Link or HLS Playlist URL/i);
    const submitButton = screen.getByRole('button', { name: /Stream/i });

    const validMagnet = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10';
    fireEvent.change(input, { target: { value: validMagnet } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(validMagnet, 'magnet');
    });
  });

  it('accepts valid m3u8 URL', async () => {
    const mockOnSubmit = jest.fn();
    render(<MagnetInputForm onSubmit={mockOnSubmit} />);

    const input = screen.getByLabelText(/Magnet Link or HLS Playlist URL/i);
    const submitButton = screen.getByRole('button', { name: /Stream/i });

    const validM3u8 = 'https://example.com/playlist.m3u8';
    fireEvent.change(input, { target: { value: validM3u8 } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(validM3u8, 'hls');
    });
  });

  it('shows legal notice', () => {
    const mockOnSubmit = jest.fn();
    render(<MagnetInputForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText(/Legal Notice/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Only use this tool with content you have the right to access/i)
    ).toBeInTheDocument();
  });
});
