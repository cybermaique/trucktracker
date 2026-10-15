import type { QueryClient } from "@tanstack/react-query";
import {
  data,
  type LoaderFunctionArgs,
  type RouteObject,
  type ShouldRevalidateFunction,
} from "react-router";
import { AppLoading, AppShell } from "@/components/layout/app-shell";
import { RouteError } from "@/components/route-error";
import { userLocationQueryOptions } from "@/features/location/use-user-location";
import { trucksQueryOptions } from "@/features/trucks/api/queries";

// Filters live in the query string; changing them must not re-run loaders.
const onlyOnPathChange: ShouldRevalidateFunction = ({ currentUrl, nextUrl }) =>
  currentUrl.pathname !== nextUrl.pathname;

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

  const prefetchLocation = () => {
    void queryClient.prefetchQuery(userLocationQueryOptions);
    return null;
  };

  // Blocking loader: the page needs the truck, and unknown ids become a 404.
  const loadTruck = async ({ params }: LoaderFunctionArgs) => {
    void queryClient.prefetchQuery(userLocationQueryOptions);
    const trucks = await queryClient.ensureQueryData(trucksQueryOptions());
    const truck = trucks.find(({ id }) => id === params.truckId);
    if (!truck) {
      throw data(null, { status: 404, statusText: "Caminhão não encontrado" });
    }
    return { identifier: truck.identifier };
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
          shouldRevalidate: onlyOnPathChange,
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
              shouldRevalidate: onlyOnPathChange,
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
            {
              path: ":truckId",
              loader: loadTruck,
              // Renders inside the app shell, keeping navigation available.
              errorElement: <RouteError />,
              handle: {
                crumb: (loaderData: unknown) =>
                  (loaderData as { identifier?: string } | undefined)
                    ?.identifier ?? "Caminhão",
              },
              lazy: {
                Component: async () =>
                  (await import("@/pages/truck-details-page")).TruckDetailsPage,
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
