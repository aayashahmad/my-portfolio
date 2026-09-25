import { render, screen } from "@testing-library/react";
import App from "./App";

beforeAll(() => {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

test("renders the hero heading and main sections", () => {
  render(<App />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/with React/);
  expect(screen.getByRole("heading", { name: /things i've built/i })).toBeInTheDocument();
});
