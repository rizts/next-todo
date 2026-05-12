import { render, screen } from "@testing-library/react";
import Home from "../app/page.tsx";
import "@testing-library/jest-dom";

describe("Landing Page (Home)", () => {
  it("renders the main heading", () => {
    render(<Home />);
    expect(screen.getByText(/Modern Todo Application/i)).toBeInTheDocument();
  });

  it("renders the app description", () => {
    render(<Home />);
    expect(screen.getByText(/Next\.js and FastAPI/i)).toBeInTheDocument();
  });

  it("contains a link to the login page", () => {
    render(<Home />);
    const loginLink = screen.getByRole("link", { name: /get started/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("renders simple features", () => {
    render(<Home />);
    expect(screen.getByText(/Secure Auth/i)).toBeInTheDocument();
    expect(screen.getByText(/Fast Sync/i)).toBeInTheDocument();
  });
});
