import type { Decorator } from "@storybook/react-vite";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { useState } from "react";

// Link を使う部品のために、その場で描くだけのルーターを用意する。
export const withRouter: Decorator = (Story) => {
  const [router] = useState(() =>
    createRouter({
      routeTree: createRootRoute({ component: Story }),
      history: createMemoryHistory({ initialEntries: ["/"] }),
    }),
  );
  return <RouterProvider router={router} />;
};
