import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Register from "@/pages/Register";
import Contact from "@/pages/Contact";
import Payment from "@/pages/Payment";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    register: vi.fn(),
  }),
}));

vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({
    items: [{ id: "1", title: "Annale Test", quantity: 1, price: 2000, type: "annale" }],
    totalPrice: 2000,
    clearCart: vi.fn(),
  }),
}));

describe("Form accessibility labels", () => {
  it("register form fields are associated with labels", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Register />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Nom complet")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmer le mot de passe")).toBeInTheDocument();
  });

  it("contact form fields are associated with labels", () => {
    render(<Contact />);

    expect(screen.getByLabelText("Nom")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Sujet")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
  });

  it("payment phone input is associated with label", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Payment />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Numéro de téléphone")).toBeInTheDocument();
  });
});
