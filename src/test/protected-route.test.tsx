import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "@/components/ProtectedRoute";

const mockUseAuth = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/components/Loader", () => ({
  default: () => <div>Loading...</div>,
}));

function renderWithRouter() {
  return render(
    <MemoryRouter
      initialEntries={["/paiement"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route
          path="/paiement"
          element={
            <ProtectedRoute>
              <div>Payment Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/connexion" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it("shows a loader while auth is resolving", () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: true });

    renderWithRouter();

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to login", () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false });

    renderWithRouter();

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders protected content for authenticated users", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", name: "Moussa", email: "moussa@test.sn" },
      isLoading: false,
    });

    renderWithRouter();

    expect(screen.getByText("Payment Content")).toBeInTheDocument();
  });
});
