import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import UsersPage from '@/app/admin/users/page';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/admin/users'),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe('UsersPage', () => {
  const mockUsers = [
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      level: 5,
      points: 1250,
      streak_days: 12,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T10:00:00Z',
    },
    {
      id: 2,
      name: 'Ayşe Kaya',
      email: 'ayse@example.com',
      level: 3,
      points: 680,
      streak_days: 7,
      created_at: '2024-01-10T10:00:00Z',
      updated_at: '2024-01-18T10:00:00Z',
    },
  ];

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('shows loading skeleton while fetching data', async () => {
    // Delay the response to ensure loading state is visible
    mockFetch.mockImplementation(() => 
      new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ data: mockUsers }),
      }), 100))
    );

    render(<UsersPage />);

    // Check for loading skeleton elements (animate-pulse elements)
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('fetches users from API on mount', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockUsers }),
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/users');
    });
  });

  it('displays user data in table after loading', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockUsers }),
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    });

    expect(screen.getByText('ayse@example.com')).toBeInTheDocument();
    expect(screen.getByText('Seviye 5')).toBeInTheDocument();
    expect(screen.getByText('Seviye 3')).toBeInTheDocument();
  });

  it('displays correct user columns: name, email, level, points, streak_days, created_at', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockUsers }),
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText('Kullanıcı')).toBeInTheDocument();
    expect(screen.getByText('E-posta')).toBeInTheDocument();
    expect(screen.getByText('Seviye')).toBeInTheDocument();
    expect(screen.getByText('Puan')).toBeInTheDocument();
    expect(screen.getByText('Seri Gün')).toBeInTheDocument();
    expect(screen.getByText('Kayıt Tarihi')).toBeInTheDocument();

    // Check user data is displayed
    expect(screen.getByText('ahmet@example.com')).toBeInTheDocument();
    expect(screen.getByText('1.250')).toBeInTheDocument(); // Turkish locale
    expect(screen.getByText('12 gün')).toBeInTheDocument();
  });

  it('shows error state when API fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch users',
        },
      }),
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Bir hata oluştu')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to fetch users')).toBeInTheDocument();
  });

  it('shows error state on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Bir hata oluştu')).toBeInTheDocument();
    });

    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('has refresh button that reloads data', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockUsers }),
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    });

    // Clear mock to track new calls
    mockFetch.mockClear();

    // Click refresh button
    const refreshButton = screen.getByLabelText('Refresh users list');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/users');
    });
  });

  it('has retry button in error state', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Initial error'));

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Bir hata oluştu')).toBeInTheDocument();
    });

    // Setup success for retry
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockUsers }),
    });

    // Click retry button
    const retryButton = screen.getByLabelText('Retry loading users');
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    });
  });

  it('shows empty state when no users exist', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Kullanıcı bulunamadı')).toBeInTheDocument();
    });

    expect(screen.getByText('Henüz hiç kullanıcı kaydedilmemiş.')).toBeInTheDocument();
  });

  it('displays user initials correctly', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockUsers }),
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    });

    // Check initials are displayed (AY for Ahmet Yılmaz)
    expect(screen.getByText('AY')).toBeInTheDocument();
  });

  it('formats dates correctly in Turkish locale', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockUsers }),
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    });

    // Check date is formatted (should contain year)
    const dateCells = screen.getAllByText(/2024/);
    expect(dateCells.length).toBeGreaterThan(0);
  });

  it('formats points with Turkish number format', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            level: 1,
            points: 1234567,
            streak_days: 0,
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-20T10:00:00Z',
          },
        ],
      }),
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Turkish locale uses period as thousands separator
    expect(screen.getByText('1.234.567')).toBeInTheDocument();
  });
});
