import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Dashboard from "@/admin/pages/Dashboard";
import { getAdminAuditLogsApi, getAdminOverviewApi, getAdminStatsApi } from "@/utils/api";

vi.mock("@/utils/api", async () => {
  const actual = await vi.importActual<typeof import("@/utils/api")>("@/utils/api");
  return {
    ...actual,
    getAdminStatsApi: vi.fn(),
    getAdminOverviewApi: vi.fn(),
    getAdminAuditLogsApi: vi.fn(),
  };
});

const mockedStats = vi.mocked(getAdminStatsApi);
const mockedOverview = vi.mocked(getAdminOverviewApi);
const mockedAudit = vi.mocked(getAdminAuditLogsApi);

describe("Admin dashboard refresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedStats.mockResolvedValue({
      total_revenue: 150000,
      orders_count: 12,
      users_count: 30,
      annales_sold: 40,
    });
    mockedOverview.mockResolvedValue({
      counts: {
        users: 30,
        annales: 10,
        concours: 8,
        orders: 12,
        payments: 11,
        contact_messages: 5,
        service_requests: 3,
      },
      recent_orders: [],
      recent_contacts: [],
      recent_service_requests: [],
    });
    mockedAudit.mockResolvedValue([]);
  });

  it("loads data initially and reloads on refresh click", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Tableau de bord")).toBeInTheDocument();
    });

    const refreshBtn = screen.getByRole("button", { name: "Actualiser" });
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(mockedStats).toHaveBeenCalledTimes(2);
      expect(mockedOverview).toHaveBeenCalledTimes(2);
      expect(mockedAudit).toHaveBeenCalledTimes(2);
    });
  });
});
