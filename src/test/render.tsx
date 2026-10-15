import { QueryClient } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { Providers } from "@/app/providers";
import { createRoutes } from "@/app/routes";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });

function renderRouter(
  router: ReturnType<typeof createMemoryRouter>,
  queryClient = createTestQueryClient()
) {
  const user = userEvent.setup();
  const view = render(
    <Providers queryClient={queryClient}>
      <RouterProvider router={router} />
    </Providers>
  );
  return { ...view, user, router, queryClient };
}

/** Renders the real application routes at `path` (pages, layout, data). */
export const renderApp = (path = "/") => {
  const queryClient = createTestQueryClient();
  return renderRouter(
    createMemoryRouter(createRoutes(queryClient), { initialEntries: [path] }),
    queryClient
  );
};

/** Renders a single element with every provider and a router context. */
export const renderWithProviders = (ui: ReactElement, path = "/") =>
  renderRouter(
    createMemoryRouter([{ path: "*", element: ui }], {
      initialEntries: [path],
    })
  );
