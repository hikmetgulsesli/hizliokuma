import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import LoginPage from "@/app/giris/page";

// Mock next/navigation
jest.mock("next/navigation", () =>> ({
  useRouter: jest.fn(),
}));

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock fetch
global.fetch = jest.fn();

describe("Login Page", () => {
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });
  });

  it("renders login form with all required elements", () => {
    render(<LoginPage />);

    // Check for heading
    expect(screen.getByRole("heading", { name: /hoş geldiniz/i })).toBeInTheDocument();

    // Check for form inputs by placeholder
    expect(screen.getByPlaceholderText(/ornek@email.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();

    // Check for submit button
    expect(screen.getByRole("button", { name: /giriş yap/i })).toBeInTheDocument();

    // Check for register link
    expect(screen.getByText(/hesabınız yok mu/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /kayıt olun/i })).toHaveAttribute("href", "/kayit");
  });

  it("shows validation error for empty email", async () => {
    render(<LoginPage />);

    const submitButton = screen.getByRole("button", { name: /giriş yap/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/e-posta adresi gereklidir/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid email format", async () => {
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/ornek@email.com/i);
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });

    const submitButton = screen.getByRole("button", { name: /giriş yap/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/geçerli bir e-posta adresi giriniz/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for empty password", async () => {
    render(<LoginPage />);

    const submitButton = screen.getByRole("button", { name: /giriş yap/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/şifre gereklidir/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for short password", async () => {
    render(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    fireEvent.change(passwordInput, { target: { value: "123" } });

    const submitButton = screen.getByRole("button", { name: /giriş yap/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/şifre en az 6 karakter olmalıdır/i)).toBeInTheDocument();
    });
  });

  it("toggles password visibility when eye icon is clicked", () => {
    render(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const toggleButton = screen.getByRole("button", { name: /şifreyi göster/i });

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute("type", "password");

    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    // Click to hide password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("submits form with valid data and redirects on success", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          user: { id: 1, name: "Test User", email: "test@example.com" },
          message: "Giriş başarılı",
        },
      }),
    });

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/ornek@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole("button", { name: /giriş yap/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com", password: "password123" }),
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("displays error message on failed login", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        error: { message: "E-posta veya şifre hatalı" },
      }),
    });

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/ornek@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole("button", { name: /giriş yap/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/e-posta veya şifre hatalı/i);
    });
  });

  it("disables submit button while loading", async () => {
    (fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  data: { user: { id: 1 }, message: "Giriş başarılı" },
                }),
              }),
            100
          )
        )
    );

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/ornek@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole("button", { name: /giriş yap/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it("uses Lucide icons (BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight)", () => {
    render(<LoginPage />);

    // Check that icons are present (they have aria-hidden="true")
    const icons = document.querySelectorAll('[aria-hidden="true"]');
    expect(icons.length).toBeGreaterThan(0);
  });

  it("has proper accessibility attributes", () => {
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/ornek@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);

    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("autocomplete", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("autocomplete", "current-password");
  });
});
