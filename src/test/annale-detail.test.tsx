import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AnnaleDetail from "@/pages/AnnaleDetail";

const { mockGetAnnalesApi, mockGetAnnaleByIdApi, mockAddItem } = vi.hoisted(() => ({
  mockGetAnnalesApi: vi.fn(),
  mockGetAnnaleByIdApi: vi.fn(),
  mockAddItem: vi.fn(),
}));

vi.mock("@/utils/api", async () => {
  const actual = await vi.importActual<typeof import("@/utils/api")>("@/utils/api");
  return {
    ...actual,
    getAnnalesApi: mockGetAnnalesApi,
    getAnnaleByIdApi: mockGetAnnaleByIdApi,
  };
});

vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({
    addItem: mockAddItem,
  }),
}));

vi.mock("@/components/BadgePopulaire", () => ({
  default: () => <span>Populaire</span>,
}));

vi.mock("@/components/BadgeNouveau", () => ({
  default: () => <span>Nouveau</span>,
}));

vi.mock("@/components/ModalPDFPreview", () => ({
  default: () => null,
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
}));

function renderAnnaleDetail(pathname: string) {
  return render(
    <MemoryRouter
      initialEntries={[pathname]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/annales/:id" element={<AnnaleDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AnnaleDetail", () => {
  beforeEach(() => {
    mockGetAnnalesApi.mockReset();
    mockGetAnnaleByIdApi.mockReset();
    mockAddItem.mockReset();
  });

  it("renders annale detail and related annales when the list endpoint is paginated", async () => {
    mockGetAnnaleByIdApi.mockResolvedValue({
      id: "main-id",
      title: "Annale ENA",
      category: "Math",
      price: 1500,
      description: "Sujet et correction",
      pages: 42,
      year: 2024,
      rating: 4,
      reviews: 12,
      downloads: 30,
      image: "https://example.com/main.jpg",
      isPopular: false,
      isNew: true,
    });
    mockGetAnnalesApi.mockResolvedValue([
      {
        id: "other-id",
        title: "Annale Police",
        category: "Math",
        price: 2000,
        description: "Deuxieme annale",
        pages: 30,
        year: 2023,
        rating: 5,
        reviews: 7,
        downloads: 18,
        image: "https://example.com/other.jpg",
      },
    ]);

    renderAnnaleDetail("/annales/main-id");

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Annale ENA" })).toBeInTheDocument();
    });
    expect(screen.getByText("Annales similaires")).toBeInTheDocument();
    expect(screen.getByText("Annale Police")).toBeInTheDocument();
  });

  it("shows a not found message when the annale detail request returns a 404", async () => {
    mockGetAnnaleByIdApi.mockRejectedValue(new Error("API Error: 404 Not Found"));

    renderAnnaleDetail("/annales/missing-id");

    await waitFor(() => {
      expect(screen.getByText("Annale introuvable.")).toBeInTheDocument();
    });
  });
});