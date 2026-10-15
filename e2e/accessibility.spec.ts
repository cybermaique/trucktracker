import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures";

const PAGES = [
  { name: "overview", path: "/", ready: "Caminhões na frota" },
  { name: "trucks", path: "/caminhoes", ready: "Mostrando" },
  { name: "new truck", path: "/caminhoes/novo", ready: "Dados do caminhão" },
  { name: "truck details", path: "/caminhoes/2", ready: "Ficha do veículo" },
  { name: "not found", path: "/nao-existe", ready: "Página não encontrada" },
];

for (const theme of ["light", "dark"] as const) {
  test.describe(`Accessibility (${theme} theme)`, () => {
    test.use({ colorScheme: theme });

    for (const { name, path, ready } of PAGES) {
      test(`${name} page has no WCAG 2.1 AA violations`, async ({ page }) => {
        await page.goto(path);
        await expect(page.getByText(ready).first()).toBeVisible();

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          // Map tiles and labels are third-party imagery drawn in a canvas.
          .exclude(".maplibregl-canvas-container")
          .analyze();

        expect(results.violations).toEqual([]);
      });

      test(`${name} page fits the viewport without horizontal scroll`, async ({
        page,
      }) => {
        await page.goto(path);
        await expect(page.getByText(ready).first()).toBeVisible();

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }
  });
}
