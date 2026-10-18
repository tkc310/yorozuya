import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { AppLayout } from "./index";

function renderAt(path: string) {
  const root = createRootRoute({
    component: () => (
      <AppLayout>
        <Outlet />
      </AppLayout>
    ),
  });
  const home = createRoute({
    getParentRoute: () => root,
    path: "/",
    component: () => <h1>トップ</h1>,
  });
  const sheet = createRoute({
    getParentRoute: () => root,
    path: "/skill-sheet",
    component: () => <h1>スキルシート</h1>,
  });
  const router = createRouter({
    routeTree: root.addChildren([home, sheet]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  render(<RouterProvider router={router} />);
}

afterEach(() => {
  cleanup();
});

describe("画面の枠", () => {
  it("ロゴからトップに戻れる", async () => {
    renderAt("/skill-sheet");
    await screen.findByRole("heading", { name: "スキルシート" });
    await userEvent.click(screen.getByRole("link", { name: "よろずや トップへ" }));
    expect(await screen.findByRole("heading", { name: "トップ" })).toBeTruthy();
  });
});
