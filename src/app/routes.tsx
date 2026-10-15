import type { QueryClient } from "@tanstack/react-query";
import type { RouteObject, ShouldRevalidateFunction } from "react-router";
import { AppLoading, AppShell } from "@/components/layout/app-shell";
import { RouteError } from "@/components/route-error";
import { userLocationQueryOptions } from "@/features/location/use-user-location";
import { trucksQueryOptions } from "@/features/trucks/api/queries";

/**
 * Each page is a separate chunk, downloaded on first navigation.
 * `handle.crumb` feeds the breadcrumb in the header.
 *
 * A factory, not a constant: the router mutates route objects when it resolves
 * lazy routes, so every router instance (app, tests) needs its own copy.
 */
export const createRoutes = (queryClient: QueryClient): RouteObject[] => {
  // Loaders start fetching in parallel with the page chunk download instead
  // of after it renders. They don't block navigation: pages show skeletons.
  const prefetchFleet = () => {
    void queryClient.prefetchQuery(trucksQueryOptions());
    void queryClient.prefetchQuery(userLocationQueryOptions);
    return null;
  };
  // Filters live in the query string; changing them must not re-run loaders.
  const onlyOnPathChange: ShouldRevalidateFunction = ({
    currentUrl,
    nextUrl,
  }) => currentUrl.pathname !== nextUrl.pathname;
  const prefetchLocation = () => {
    void queryClient.prefetchQuery(userLocationQueryOptions);
    return null;
  };

  return [
    {
      path: "/",
      element: <AppShell />,
      errorElement: <RouteError />,
      hydrateFallbackElement: <AppLoading />,
      children: [
        {
          index: true,
          handle: { crumb: "Visão geral" },
          loader: prefetchFleet,
          lazy: {
            Component: async () =>
              (await import("@/pages/overview-page")).OverviewPage,
          },
        },
        {
          path: "caminhoes",
          handle: { crumb: "Caminhões" },
          children: [
            {
              index: true,
              loader: prefetchFleet,
              lazy: {
                Component: async () =>
                  (await import("@/pages/trucks-page")).TrucksPage,
              },
            },
            {
              path: "novo",
              handle: { crumb: "Novo caminhão" },
              loader: prefetchLocation,
              shouldRevalidate: onlyOnPathChange,
              lazy: {
                Component: async () =>
                  (await import("@/pages/new-truck-page")).NewTruckPage,
              },
            },
          ],
        },
        {
          path: "*",
          handle: { crumb: "Página não encontrada" },
          lazy: {
            Component: async () =>
              (await import("@/pages/not-found-page")).NotFoundPage,
          },
        },
      ],
    },
  ];
};
