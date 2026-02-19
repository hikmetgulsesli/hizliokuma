import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import PuanTablosuPage from "@/app/puan-tablosu/page";

// Mock next/link
jest.mock("next/link", () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("PuanTablosuPage", () => {
  const mockLeaderboardData = {
    data: [
      { rank: 1, name: "Ahmet Yılmaz", points: 4500, streakDays: 30, totalExercises: 45 },
      { rank: 2, name: "Ayşe Demir", points: 4200, streakDays: 25, totalExercises: 40 },
      { rank: 3, name: "Mehmet Kaya", points: 3800, streakDays: 21, totalExercises: 35 },
      { rank: 4, name: "Fatma Şahin", points: 3500, streakDays: 18, totalExercises: 30 },
      { rank: 5, name: "Ali Öztürk", points: 3200, streakDays: 15, totalExercises: 25 },
      { rank: 6, name: "Zeynep Çelik", points: 2900, streakDays: 14, totalExercises: 22 },
      { rank: 7, name: "Mustafa Doğan", points: 2600, streakDays: 12, totalExercises: 20 },
      { rank: 8, name: "Elif Arslan", points: 2300, streakDays: 10, totalExercises: 18 },
      { rank: 9, name: "Hakan Yavuz", points: 2000, streakDays: 8, totalExercises: 15 },
      { rank: 10, name: "Senem Bulut", points: 1800, streakDays: 7, totalExercises: 12 },
    ],
    meta: { limit: 50, total: 10 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockLeaderboardData,
    });
  });

  it("fetches and displays leaderboard data on mount", async () => {
    render(<PuanTablosuPage />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/leaderboard?limit=50");
    });

    await waitFor(() => {
      expect(screen.getByText("Ahmet Yılmaz")).toBeInTheDocument();
    });

    expect(screen.getByText("Ahmet Yılmaz")).toBeInTheDocument();
    expect(screen.getByText("Ayşe Demir")).toBeInTheDocument();
    expect(screen.getByText("Mehmet Kaya")).toBeInTheDocument();
  });

  it("displays top 3 users with Crown/Trophy icons (no emoji)", async () => {
    render(<PuanTablosuPage />);

    await waitFor(() => {
      expect(screen.getByText("Ahmet Yılmaz")).toBeInTheDocument();
    });

    const crownIcon = document.querySelector(".lucide-crown");
    expect(crownIcon).toBeInTheDocument();

    const pageContent = document.body.textContent || "";
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    expect(emojiRegex.test(pageContent)).toBe(false);
  });

  it("displays full leaderboard table with real user data", async () => {
    render(<PuanTablosuPage />);

    await waitFor(() => {
      expect(screen.getByText("Fatma Şahin")).toBeInTheDocument();
    });

    expect(screen.getByText("Sıra")).toBeInTheDocument();
    expect(screen.getByText("Kullanıcı")).toBeInTheDocument();
    expect(screen.getByText("Puan")).toBeInTheDocument();
    expect(screen.getByText("Streak")).toBeInTheDocument();

    expect(screen.getByText("Fatma Şahin")).toBeInTheDocument();
    expect(screen.getByText("Ali Öztürk")).toBeInTheDocument();
    expect(screen.getByText("Zeynep Çelik")).toBeInTheDocument();
  });

  it("highlights current user's position if authenticated and in top 50", async () => {
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === "user") {
        return JSON.stringify({ id: 1, name: "Fatma Şahin", email: "fatma@example.com" });
      }
      return null;
    });

    render(<PuanTablosuPage />);

    await waitFor(() => {
      expect(screen.getByText("Fatma Şahin")).toBeInTheDocument();
    });

    await waitFor(() => {
      const senBadges = screen.getAllByText("Sen");
      expect(senBadges.length).toBeGreaterThan(0);
    });
  });

  it("shows user's rank outside top 50 if authenticated", async () => {
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === "user") {
        return JSON.stringify({ id: 99, name: "Test User", email: "test@example.com" });
      }
      return null;
    });

    render(<PuanTablosuPage />);

    await waitFor(() => {
      expect(screen.getByText(/Henüz puan tablosunda yer almıyorsun/)).toBeInTheDocument();
    });
  });

  it("shows error state when fetch fails", async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    render(<PuanTablosuPage />);

    await waitFor(() => {
      expect(screen.getByText("Bir Hata Oluştu")).toBeInTheDocument();
    });

    expect(screen.getByText("Network error")).toBeInTheDocument();
  });

  it("shows error state when API returns non-ok response", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<PuanTablosuPage />);

    await waitFor(() => {
      expect(screen.getByText("Bir Hata Oluştu")).toBeInTheDocument();
    });

    expect(screen.getByText("Puan tablosu verileri alınamadı")).toBeInTheDocument();
  });

  it("allows retry on error", async () => {
    (fetch as jest.Mock)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockLeaderboardData,
      });

    render(<PuanTablosuPage />);

    await waitFor(() => {
      expect(screen.getByText("Bir Hata Oluştu")).toBeInTheDocument();
    });

    const retryButton = screen.getByText("Tekrar Dene");
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  it("displays correct points with locale formatting", async () => {
    render(<PuanTablosuPage />);

    await waitFor(() => {
      expect(screen.getByText("Ahmet Yılmaz")).toBeInTheDocument();
    });

    expect(screen.getByText("4,500")).toBeInTheDocument();
  });

  it("displays streak days with flame icon", async () => {
    render(<PuanTablosuPage />);

    await waitFor(() => {
      expect(screen.getByText("Ahmet Yılmaz")).toBeInTheDocument();
    });

    expect(screen.getByText("30 gün")).toBeInTheDocument();
  });

  it("has link back to home page", async () => {
    render(<PuanTablosuPage />);

    await waitFor(() => {
      expect(screen.getByText("Ana Sayfaya Dön")).toBeInTheDocument();
    });

    const homeLink = screen.getByText("Ana Sayfaya Dön").closest("a");
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("displays award system legend", async () => {
    render(<PuanTablosuPage />);

    await waitFor(() => {
      expect(screen.getByText("Ödül Sistemimiz")).toBeInTheDocument();
    });

    expect(screen.getByText("Bronz")).toBeInTheDocument();
    expect(screen.getByText("Gümüş")).toBeInTheDocument();
    expect(screen.getByText("Altın")).toBeInTheDocument();
  });

  it("uses Lucide icons instead of emoji", async () => {
    render(<PuanTablosuPage />);

    await waitFor(() => {
      expect(screen.getByText("Puan Tablosu")).toBeInTheDocument();
    });

    const lucideIcons = document.querySelectorAll(".lucide");
    expect(lucideIcons.length).toBeGreaterThan(0);
  });
});
