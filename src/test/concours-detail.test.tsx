import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ConcoursDetail from "@/pages/ConcoursDetail";

const { mockGetConcoursApi, mockGetConcoursByIdApi } = vi.hoisted(() => ({
  mockGetConcoursApi: vi.fn(),
  mockGetConcoursByIdApi: vi.fn(),
}));

vi.mock("@/utils/api", async () => {
  const actual = await vi.importActual("@/utils/api");
  return {
    ...actual,
    getConcoursApi: mockGetConcoursApi,
    getConcoursByIdApi: mockGetConcoursByIdApi,
  };
});

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
}));

function renderConcoursDetail(pathname: string) {
  return render(
    <MemoryRouter
      initialEntries={[pathname]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/concours/:id" element={<ConcoursDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ConcoursDetail", () => {
  beforeEach(() => {
    mockGetConcoursApi.mockReset();
    mockGetConcoursByIdApi.mockReset();
  });

  it("renders concours detail and related concours when the list endpoint is paginated", async () => {
    mockGetConcoursByIdApi.mockResolvedValue({
      id: "main-id",
      title: "ENA",
      category: "Sante",
      date: "2026-04-22",
      description: "Description concours",
      location: "Dakar",
      deadline: "2026-05-01",
      status: "open",
      image: "https://example.com/main.jpg",
      rating: 4,
      reviews: 12,
    });
    mockGetConcoursApi.mockResolvedValue([
      {
        id: "other-id",
        title: "EPS",
        category: "Sante",
        date: "2026-04-23",
        description: "Autre concours",
        location: "Thies",
        deadline: "2026-05-02",
        status: "open",
        image: "https://example.com/other.jpg",
        rating: 3,
        reviews: 4,
      },
    ]);

    renderConcoursDetail("/concours/main-id");

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "ENA" })).toBeInTheDocument();
    });
    expect(screen.getByText("Concours similaires")).toBeInTheDocument();
    expect(screen.getByText("EPS")).toBeInTheDocument();
  });

  it("shows a not found message when the concours detail request returns a 404", async () => {
    mockGetConcoursByIdApi.mockRejectedValue(new Error("API Error: 404 Not Found"));

    renderConcoursDetail("/concours/missing-id");

    await waitFor(() => {
      expect(screen.getByText("Concours introuvable.")).toBeInTheDocument();
    });
  });
});