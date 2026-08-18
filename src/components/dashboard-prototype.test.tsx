import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardPrototype } from "@/components/dashboard-prototype";

describe("DashboardPrototype", () => {
  it("shows shared completion signals without detailed academic results", () => {
    render(<DashboardPrototype />);

    expect(screen.getByRole("heading", { name: /Your plan is/ })).toBeInTheDocument();
    expect(screen.getByText("Completion is shared. Individual academic results remain private.")).toBeInTheDocument();
    expect(screen.queryByText(/band score|essay text|detailed score/i)).not.toBeInTheDocument();
  });
});
