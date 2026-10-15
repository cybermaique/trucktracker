import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { Providers } from "./providers";
import { createQueryClient } from "./query-client";
import { createRoutes } from "./routes";

const queryClient = createQueryClient();
const router = createBrowserRouter(createRoutes(queryClient), {
  basename: import.meta.env.BASE_URL,
});

export function App() {
  return (
    <Providers queryClient={queryClient}>
      <RouterProvider router={router} />
    </Providers>
  );
}
