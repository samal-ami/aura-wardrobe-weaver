import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { navigate, signUp, signInWithOAuth } = vi.hoisted(() => ({
  navigate: vi.fn(),
  signUp: vi.fn(),
  signInWithOAuth: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => options,
  useNavigate: () => navigate,
}));
vi.mock("@/lib/supabase", () => ({ supabase: { auth: { signUp, signInWithOAuth } } }));

import { Auth } from "@/routes/auth";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});
afterEach(cleanup);

describe("AURA demo entry", () => {
  it.each(["Google", "Apple"])("%s opens /home immediately without OAuth", (provider) => {
    render(<Auth />);
    fireEvent.click(screen.getByRole("button", { name: provider }));
    expect(localStorage.getItem("aura-demo-auth")).toBe("1");
    expect(navigate).toHaveBeenCalledWith({ to: "/home" });
    expect(signInWithOAuth).not.toHaveBeenCalled();
  });

  it("email registration opens /home while account creation is still pending", () => {
    signUp.mockReturnValue(new Promise(() => {}));
    render(<Auth />);
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "aura@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Пароль"), { target: { value: "example123" } });
    fireEvent.click(screen.getByRole("button", { name: "Зарегистрироваться" }));
    expect(signUp).toHaveBeenCalledWith(expect.objectContaining({ email: "aura@example.com", password: "example123" }));
    expect(navigate).toHaveBeenCalledWith({ to: "/home" });
    expect(localStorage.getItem("aura-demo-auth")).toBe("1");
  });
});