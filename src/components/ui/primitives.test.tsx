import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

describe("design primitives", () => {
  it("renders status text in addition to its visual treatment", () => {
    render(<Badge status="in-progress" />);

    expect(screen.getByText("In progress")).toBeInTheDocument();
  });

  it("connects a form label to its input and exposes invalid state", () => {
    render(<><Label htmlFor="focus">Study focus</Label><Input aria-invalid id="focus" /></>);

    expect(screen.getByLabelText("Study focus")).toHaveAttribute("aria-invalid", "true");
  });

  it("cycles between system, dark, and light theme preferences", () => {
    render(<AppShell><p>Content</p></AppShell>);

    const themeButton = screen.getByRole("button", { name: "Theme: system. Change theme" });
    fireEvent.click(themeButton);

    expect(screen.getByRole("button", { name: "Theme: dark. Change theme" })).toBeInTheDocument();
  });
});
