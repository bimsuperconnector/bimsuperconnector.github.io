import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { App } from "@/App";

// Keep unit tests hermetic: never talk to a real Firebase project.
vi.mock("@/services/firebase/config", () => ({
  auth: {},
  db: {},
}));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: (_auth: unknown, callback: (user: null) => void) => {
    callback(null);
    return () => {};
  },
  GoogleAuthProvider: class {},
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(),
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("public routing", () => {
  it("shows the landing page at /", () => {
    renderAt("/");
    expect(
      screen.getByText(/private network for BIM alumni/i),
    ).toBeInTheDocument();
  });

  it("shows the login page at /login", () => {
    renderAt("/login");
    expect(
      screen.getByRole("heading", { name: /sign in to superconnector/i }),
    ).toBeInTheDocument();
  });
});

describe("protected routing", () => {
  it("redirects an unauthenticated visitor away from /dashboard", () => {
    renderAt("/dashboard");
    expect(
      screen.getByRole("heading", { name: /sign in to superconnector/i }),
    ).toBeInTheDocument();
  });
});
