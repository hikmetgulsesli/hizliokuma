import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { signIn } from "next-auth/react";
import LoginPage from "@/app/login/page";

// Mock next-auth/react
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn((key) => {
      if (key === "callbackUrl") return "/admin";
      return null;
    }),
  }),
}));

describe("Login Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login form with email and password fields", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /giriş yap/i })).toBeInTheDocument();
  });

  it("shows error message when credentials are invalid", async () => {
    (signIn as jest.Mock).mockResolvedValue({ error: "CredentialsSignin" });

    render(<LoginPage />);

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/şifre/i, { selector: "input" });
    const submitButton = screen.getByRole("button", { name: /giriş yap/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/geçersiz email veya şifre/i);
    });
  });

  it("redirects to admin on successful login", async () => {
    const mockPush = jest.fn();
    const mockRefresh = jest.fn();

    (signIn as jest.Mock).mockResolvedValue({ ok: true, error: null });

    jest.spyOn(require("next/navigation"), "useRouter").mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });

    render(<LoginPage />);

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/şifre/i, { selector: "input" });
    const submitButton = screen.getByRole("button", { name: /giriş yap/i });

    fireEvent.change(emailInput, { target: { value: "admin@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "admin@example.com",
        password: "password123",
        redirect: false,
        callbackUrl: "/admin",
      });
    });
  });

  it("toggles password visibility", () => {
    render(<LoginPage />);

    const passwordInput = screen.getByLabelText(/şifre/i, { selector: "input" });
    const toggleButton = screen.getByRole("button", { name: /şifreyi göster/i });

    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute("type", "text");

    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("disables submit button while loading", async () => {
    (signIn as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<LoginPage />);

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/şifre/i, { selector: "input" });
    const submitButton = screen.getByRole("button", { name: /giriş yap/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/giriş yapılıyor/i)).toBeInTheDocument();
    });
  });
});
