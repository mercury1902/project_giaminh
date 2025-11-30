import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GeminiChatPanel from '../gemini-chat-panel.jsx';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const defaultProps = {
  isOpen: true,
  onClose: vi.fn()
};

describe('GeminiChatPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it('renders closed when isOpen=false', () => {
    render(<GeminiChatPanel {...defaultProps} isOpen={false} />);
    expect(screen.queryByLabelText(/Gemini Chat/)).not.toBeInTheDocument();
  });

  it('renders open panel with header, messages, input', () => {
    render(<GeminiChatPanel {...defaultProps} />);
    expect(screen.getByText('Trợ lý lịch sử Gemini')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Hỏi về lịch sử Việt Nam...')).toBeInTheDocument();
  });

  it('focuses input on open', async () => {
    const user = userEvent.setup();
    render(<GeminiChatPanel {...defaultProps} />);
    const input = screen.getByPlaceholderText('Hỏi về lịch sử Việt Nam...');
    await waitFor(() => expect(input).toHaveFocus());
  });

  it('handles sendMessage: loading, stream response', async () => {
    const user = userEvent.setup();
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('Streamed response'));
        controller.close();
      }
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: mockStream,
      status: 200
    });

    render(<GeminiChatPanel {...defaultProps} />);

    const input = screen.getByPlaceholderText('Hỏi về lịch sử Việt Nam...');
    await user.type(input, 'Test query{enter}');

    expect(mockFetch).toHaveBeenCalledWith('/api/gemini/chat', expect.any(Object));

    await waitFor(() => {
      expect(screen.getByText('Streamed response')).toBeInTheDocument();
    });
    expect(screen.queryByText('Đang suy nghĩ...')).not.toBeInTheDocument();
  });

  it('shows loading during send, disables input/button', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: new ReadableStream({ start() {} }), // empty stream
      status: 200
    });

    render(<GeminiChatPanel {...defaultProps} />);

    const input = screen.getByPlaceholderText('Hỏi về lịch sử Việt Nam...');
    const button = screen.getByRole('button', { name: /Gửi/ });

    await user.type(input, 'test');
    await user.click(button);

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
    expect(screen.getByText('Đang suy nghĩ...')).toBeInTheDocument();
  });

  it('handles fetch error: shows error message', async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<GeminiChatPanel {...defaultProps} />);

    const input = screen.getByPlaceholderText('Hỏi về lịch sử Việt Nam...');
    await user.type(input, 'test{enter}');

    await waitFor(() => {
      expect(screen.getByText('Lỗi kết nối. Thử lại.')).toBeInTheDocument();
    });
  });

  it('closes on overlay click', async () => {
    const user = userEvent.setup();
    render(<GeminiChatPanel {...defaultProps} />);
    const overlay = screen.getByRole('dialog');
    await user.click(overlay);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('prevents close on panel click', async () => {
    const user = userEvent.setup();
    const onCloseSpy = vi.fn();
    render(<GeminiChatPanel isOpen={true} onClose={onCloseSpy} />);
    const panel = screen.getByText('Trợ lý lịch sử Gemini').closest('.gemini-chat-panel');
    await user.click(panel);
    expect(onCloseSpy).not.toHaveBeenCalled();
  });

  it('ignores empty input on submit', async () => {
    const user = userEvent.setup();
    render(<GeminiChatPanel {...defaultProps} />);
    const form = screen.getByPlaceholderText('Hỏi về lịch sử Việt Nam...').closest('form');
    fireEvent.submit(form);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});