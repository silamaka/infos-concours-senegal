import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Login from "@/pages/Login";

const mockLogin = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

function renderLogin(initialEntry: { pathname: string; state?: unknown }) {
  return render(
    <MemoryRouter
      initialEntries={[initialEntry]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/connexion" element={<Login />} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        <Route path="/annales" element={<div>Annales Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Login page redirects", () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  it("redirects to originally requested protected path after successful login", async () => {
    mockLogin.mockResolvedValue(undefined);

    renderLogin({
      pathname: "/connexion",
      state: { from: { pathname: "/annales" } },
    });

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "moussa@test.sn" } });
    fireEvent.change(screen.getByLabelText("Mot de passe"), { target: { value: "secret123" } });
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(screen.getByText("Annales Page")).toBeInTheDocument();
    });
  });

  it("falls back to dashboard when no valid origin route is provided", async () => {
    mockLogin.mockResolvedValue(undefined);

    renderLogin({ pathname: "/connexion" });

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "moussa@test.sn" } });
    fireEvent.change(screen.getByLabelText("Mot de passe"), { target: { value: "secret123" } });
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
    });
  });
});
