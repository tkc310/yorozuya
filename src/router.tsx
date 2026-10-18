import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // リンクにマウスを乗せるかフォーカスしたら、遷移先のコードとデータを先に読む。
    // データの鮮度は TanStack Query に任せるため、ルーター側では毎回 loader を呼ぶ。
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }

  // パンくずリストに出す名前。
  interface StaticDataRouteOption {
    crumb?: string;
  }
}
