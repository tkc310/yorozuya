import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AppLayout } from "../components/layouts/AppLayout/index";
import favicon from "../assets/images/favicon.ico?url";
import appleTouchIcon from "../assets/images/icon_apple.png";
import "../styles/global.css";

export type RouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "よろずや" },
      { name: "theme-color", content: "#ffffff" },
    ],
    links: [
      // タブのアイコンは favicon.ico だけにする。SVG の icon を並べるとブラウザが SVG を選び、
      // 透過した黒い紋がダークモードのタブで見えなくなる。LP と Storybook も同じ favicon.ico を使う。
      { rel: "icon", href: favicon, sizes: "16x16 32x32 48x48 64x64", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: appleTouchIcon },
    ],
  }),
  staticData: { crumb: "トップ" },
  component: RootComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <AppLayout>
          <Outlet />
        </AppLayout>
      </QueryClientProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
