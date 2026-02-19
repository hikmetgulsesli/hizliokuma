import { render, screen } from "@testing-library/react";
import AdminLayout from "@/app/admin/layout";

// Mock next-auth/next
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

describe("Admin Layout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to login when user is not authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    try {
      await AdminLayout({ children: <div>Test Content</div> });
    } catch {
      // redirect throws an error in Next.js
    }

    expect(redirect).toHaveBeenCalledWith("/login?callbackUrl=/admin");
  });

  it("renders admin content when user is authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: {
        name: "Admin User",
        email: "admin@example.com",
        role: "ADMIN",
      },
    });

    const Layout = await AdminLayout({ children: <div>Test Content</div> });
    render(Layout);

    expect(screen.getByText("Test Content")).toBeInTheDocument();
    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("Çıkış Yap")).toBeInTheDocument();
  });

  it("shows user email when name is not available", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: {
        email: "admin@example.com",
        role: "ADMIN",
      },
    });

    const Layout = await AdminLayout({ children: <div>Test Content</div> });
    render(Layout);

    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
  });
});
