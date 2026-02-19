import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import RewardsPage from '@/app/admin/rewards/page';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/admin/rewards'),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe('RewardsPage', () => {
  const mockRewards = [
    {
      id: 1,
      title: 'Bronz Madalya',
      description: 'İlk 25 puanı kazan',
      type: 'medal',
      threshold: 25,
      icon: null,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 2,
      title: 'Gümüş Madalya',
      description: '50 puanı geç',
      type: 'medal',
      threshold: 50,
      icon: null,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 3,
      title: '7 Gün Seri',
      description: '7 gün üst üste çalış',
      type: 'streak',
      threshold: 7,
      icon: null,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    },
  ];

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('shows loading skeleton while fetching rewards', async () => {
    // Delay the fetch to keep loading state visible
    mockFetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<RewardsPage />);

    // Should show loading skeleton (multiple skeleton cards)
    const skeletonCards = document.querySelectorAll('.animate-pulse');
    expect(skeletonCards.length).toBeGreaterThan(0);
  });

  it('fetches rewards from API on mount', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockRewards, meta: { total: 3 } }),
    });

    render(<RewardsPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/rewards');
    });
  });

  it('displays reward cards with correct data', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockRewards, meta: { total: 3 } }),
    });

    render(<RewardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Bronz Madalya')).toBeInTheDocument();
    });

    // Check all rewards are displayed
    expect(screen.getByText('Bronz Madalya')).toBeInTheDocument();
    expect(screen.getByText('Gümüş Madalya')).toBeInTheDocument();
    expect(screen.getByText('7 Gün Seri')).toBeInTheDocument();

    // Check descriptions
    expect(screen.getByText('İlk 25 puanı kazan')).toBeInTheDocument();
    expect(screen.getByText('50 puanı geç')).toBeInTheDocument();

    // Check types and thresholds
    const medalBadges = screen.getAllByText('medal');
    expect(medalBadges.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('streak')).toBeInTheDocument();
  });

  it('displays threshold values correctly', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockRewards, meta: { total: 3 } }),
    });

    render(<RewardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Bronz Madalya')).toBeInTheDocument();
    });

    // Check threshold values are displayed
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('shows error state when API fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch rewards' },
      }),
    });

    render(<RewardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch rewards')).toBeInTheDocument();
    });
  });

  it('shows error state on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<RewardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('refresh button triggers refetch', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockRewards, meta: { total: 3 } }),
    });

    render(<RewardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Bronz Madalya')).toBeInTheDocument();
    });

    // Clear mock and set up new response
    mockFetch.mockClear();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [...mockRewards, { id: 4, title: 'Yeni Ödül', type: 'points', threshold: 100 }],
        meta: { total: 4 },
      }),
    });

    // Click refresh button
    const refreshButton = screen.getByLabelText('Refresh rewards list');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/rewards');
    });
  });

  it('shows empty state when no rewards exist', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], meta: { total: 0 } }),
    });

    render(<RewardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Henüz ödül yok')).toBeInTheDocument();
    });

    expect(screen.getByText('Ödül sistemi oluşturmak için ilk ödülünüzü ekleyin.')).toBeInTheDocument();
  });

  it('opens modal when Add Reward button is clicked', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockRewards, meta: { total: 3 } }),
    });

    render(<RewardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Bronz Madalya')).toBeInTheDocument();
    });

    const addButton = screen.getByLabelText('Add new reward');
    fireEvent.click(addButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Yeni Ödül Ekle')).toBeInTheDocument();
  });

  it('opens modal with reward data when Edit button is clicked', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockRewards, meta: { total: 3 } }),
    });

    render(<RewardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Bronz Madalya')).toBeInTheDocument();
    });

    const editButton = screen.getByLabelText('Edit Bronz Madalya');
    fireEvent.click(editButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Ödül Düzenle')).toBeInTheDocument();

    // Check form is pre-filled
    const titleInput = screen.getByLabelText(/Başlık/i) as HTMLInputElement;
    expect(titleInput.value).toBe('Bronz Madalya');
  });

  it('creates a new reward successfully', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockRewards, meta: { total: 3 } }),
    });

    render(<RewardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Bronz Madalya')).toBeInTheDocument();
    });

    // Open modal
    const addButton = screen.getByLabelText('Add new reward');
    fireEvent.click(addButton);

    // Fill form
    const titleInput = screen.getByLabelText(/Başlık/i);
    fireEvent.change(titleInput, { target: { value: 'Yeni Ödül' } });

    const descriptionInput = screen.getByLabelText(/Açıklama/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test açıklama' } });

    const thresholdInput = screen.getByLabelText(/Eşik/i);
    fireEvent.change(thresholdInput, { target: { value: '100' } });

    // Mock the POST request
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          id: 4,
          title: 'Yeni Ödül',
          description: 'Test açıklama',
          type: 'points',
          threshold: 100,
          icon: null,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
      }),
    });

    // Submit form
    const submitButton = screen.getByText('Ekle');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/rewards',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        })
      );
    });
  });

  it('updates a reward successfully', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockRewards, meta: { total: 3 } }),
    });

    render(<RewardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Bronz Madalya')).toBeInTheDocument();
    });

    // Open edit modal
    const editButton = screen.getByLabelText('Edit Bronz Madalya');
    fireEvent.click(editButton);

    // Modify form
    const titleInput = screen.getByLabelText(/Başlık/i);
    fireEvent.change(titleInput, { target: { value: 'Güncellenmiş Ödül' } });

    // Mock the PUT request
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          ...mockRewards[0],
          title: 'Güncellenmiş Ödül',
        },
      }),
    });

    // Submit form
    const submitButton = screen.getByText('Güncelle');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/rewards/1',
        expect.objectContaining({
          method: 'PUT',
          body: expect.any(String),
        })
      );
    });
  });

  it('deletes a reward after confirmation', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockRewards, meta: { total: 3 } }),
    });

    render(<RewardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Bronz Madalya')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByLabelText('Delete Bronz Madalya');
    fireEvent.click(deleteButton);

    // Confirmation dialog should appear
    await waitFor(() => {
      expect(screen.getByText('Bu ödülü silmek istediğinize emin misiniz?')).toBeInTheDocument();
    });

    // Mock the DELETE request
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Reward deleted successfully' }),
    });

    // Confirm deletion
    const confirmButton = screen.getByText('Evet, Sil');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/rewards/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  it('cancels delete when cancel button is clicked', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockRewards, meta: { total: 3 } }),
    });

    render(<RewardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Bronz Madalya')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByLabelText('Delete Bronz Madalya');
    fireEvent.click(deleteButton);

    // Confirmation dialog should appear
    await waitFor(() => {
      expect(screen.getByText('Bu ödülü silmek istediğinize emin misiniz?')).toBeInTheDocument();
    });

    // Cancel deletion
    const cancelButton = screen.getByText('İptal');
    fireEvent.click(cancelButton);

    // Confirmation should disappear
    await waitFor(() => {
      expect(screen.queryByText('Bu ödülü silmek istediğinize emin misiniz?')).not.toBeInTheDocument();
    });

    // DELETE should not have been called
    const deleteCalls = mockFetch.mock.calls.filter((call) =>
      call[1]?.method === 'DELETE'
    );
    expect(deleteCalls).toHaveLength(0);
  });

  it('closes modal when clicking close button', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockRewards, meta: { total: 3 } }),
    });

    render(<RewardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Bronz Madalya')).toBeInTheDocument();
    });

    // Open modal
    const addButton = screen.getByLabelText('Add new reward');
    fireEvent.click(addButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Click close button
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('uses Lucide icons instead of emoji', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockRewards, meta: { total: 3 } }),
    });

    render(<RewardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Bronz Madalya')).toBeInTheDocument();
    });

    // Check that no emoji characters are rendered in reward cards
    // The page should use Lucide icons (Target, Medal, Flame, Trophy, etc.)
    const pageContent = document.body.textContent || '';

    // Common emoji patterns that should NOT be present
    const emojiPatterns = [
      /[\u{1F300}-\u{1F9FF}]/u, // Miscellaneous Symbols and Pictographs
      /[\u{2600}-\u{26FF}]/u, // Miscellaneous Symbols
      /[\u{2700}-\u{27BF}]/u, // Dingbats
    ];

    for (const pattern of emojiPatterns) {
      expect(pageContent).not.toMatch(pattern);
    }
  });

  it('displays reward type badges correctly', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockRewards, meta: { total: 3 } }),
    });

    render(<RewardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Bronz Madalya')).toBeInTheDocument();
    });

    // Check type badges are displayed
    const medalBadges = screen.getAllByText('medal');
    expect(medalBadges.length).toBeGreaterThanOrEqual(2);

    const streakBadge = screen.getByText('streak');
    expect(streakBadge).toBeInTheDocument();
  });

  it('validates form before submission', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], meta: { total: 0 } }),
    });

    render(<RewardsPage />);

    await waitFor(() => {
      expect(screen.getByText('Henüz ödül yok')).toBeInTheDocument();
    });

    // Open modal
    const addButton = screen.getByLabelText('Add new reward');
    fireEvent.click(addButton);

    // Clear title and try to submit
    const titleInput = screen.getByLabelText(/Başlık/i);
    fireEvent.change(titleInput, { target: { value: '' } });

    const submitButton = screen.getByText('Ekle');
    fireEvent.click(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Başlık gereklidir')).toBeInTheDocument();
    });

    // POST should not have been called
    const postCalls = mockFetch.mock.calls.filter((call) =>
      call[1]?.method === 'POST'
    );
    expect(postCalls).toHaveLength(0);
  });
});
