import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { loginApi, logoutApi, meApi, registerApi } from "@/utils/api";

vi.mock("@/utils/api", async () => {
  const actual = await vi.importActual<typeof import("@/utils/api")>("@/utils/api");
  return {
    ...actual,
    loginApi: vi.fn(),
    registerApi: vi.fn(),
    logoutApi: vi.fn(),
    meApi: vi.fn(),
  };
});

const mockedLoginApi = vi.mocked(loginApi);
const mockedRegisterApi = vi.mocked(registerApi);
const mockedLogoutApi = vi.mocked(logoutApi);
const mockedMeApi = vi.mocked(meApi);

function AuthHarness() {
  const { user, isLoading, register, login, logout } = useAuth();
  const [error, setError] = useState("");

  const handleAction = async (action: () => Promise<void>) => {
    setError("");
    try {
      await action();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    }
  };

  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="user-email">{user?.email ?? "none"}</div>
      <div data-testid="error">{error}</div>

      <button onClick={() => handleAction(() => register("Moussa Diop", "moussa@test.sn", "secret123"))}>
        register
      </button>
      <button onClick={() => handleAction(() => login("moussa@test.sn", "secret123"))}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockedMeApi.mockRejectedValue(new Error("unauthenticated"));
    mockedLogoutApi.mockResolvedValue(undefined);
  });

  it("registers and persists the authenticated user", async () => {
    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    mockedRegisterApi.mockResolvedValue({
      access: "access-token-register",
      refresh: "refresh-token-register",
      user: {
        id: "user-1",
        name: "Moussa Diop",
        email: "moussa@test.sn",
        first_name: "Moussa",
        last_name: "Diop",
        role: "USER",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "register" }));

    await waitFor(
      () => {
        expect(screen.getByTestId("user-email")).toHaveTextContent("moussa@test.sn");
      },
      { timeout: 2500 },
    );

    expect(localStorage.getItem("auth_token")).toBe("access-token-register");
    expect(localStorage.getItem("refresh_token")).toBe("refresh-token-register");
  });

  it("logs in a previously registered user and supports logout", async () => {
    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    mockedLoginApi.mockResolvedValue({
      access: "access-token-login",
      refresh: "refresh-token-login",
      user: {
        id: "user-1",
        name: "Moussa Diop",
        email: "moussa@test.sn",
        first_name: "Moussa",
        last_name: "Diop",
        role: "USER",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "login" }));

    await waitFor(
      () => {
        expect(screen.getByTestId("user-email")).toHaveTextContent("moussa@test.sn");
      },
      { timeout: 2500 },
    );

    fireEvent.click(screen.getByRole("button", { name: "logout" }));
    expect(screen.getByTestId("user-email")).toHaveTextContent("none");
    expect(localStorage.getItem("auth_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(mockedLogoutApi).toHaveBeenCalledWith("refresh-token-login");
  });
});
