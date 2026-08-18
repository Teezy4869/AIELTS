import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("test environment", () => {
  it("renders React components with Testing Library", () => {
    render(<p>Foundation ready</p>);

    expect(screen.getByText("Foundation ready")).toBeInTheDocument();
  });
});
