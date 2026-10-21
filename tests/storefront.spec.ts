import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("renders the complete page without overflow or broken images", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `artifacts/${testInfo.project.name}-hero-final.png`,
  });
  for (const id of ["flavors", "story", "love-notes", "happy-boxes", "faq"]) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expect(page.locator(`#${id} h2`)).toBeVisible();
  }
  const images = await page
    .locator("main img")
    .evaluateAll((elements) =>
      elements.map((image) => ({
        loaded:
          (image as HTMLImageElement).complete &&
          (image as HTMLImageElement).naturalWidth > 0,
        src: (image as HTMLImageElement).src,
      })),
    );
  expect(images.every((image) => image.loaded)).toBeTruthy();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  expect(errors).toEqual([]);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: `artifacts/${testInfo.project.name}-full-final.png`,
    fullPage: true,
  });
});

test("filters flavors and supports arrow-key tab navigation", async ({
  page,
}) => {
  await expect(page.locator(".product")).toHaveCount(3);
  await page.getByRole("tab", { name: /Sweet & savory/ }).click();
  await expect(page.locator(".product")).toHaveCount(1);
  await expect(page.locator(".product h3")).toHaveText("Creamy Cheese");
  await page.getByRole("tab", { name: /Sweet & savory/ }).press("ArrowLeft");
  await expect(page.locator(".product")).toHaveCount(2);
  await expect(page.getByRole("tab", { name: /Sweet classics/ })).toBeFocused();
  await page.getByRole("tab", { name: /Sweet classics/ }).press("Home");
  await expect(page.locator(".product")).toHaveCount(3);
});

test("opens product details, adds to bag, and restores focus", async ({
  page,
}) => {
  const product = page.getByRole("button", {
    name: "Discover Original Vanilla",
    exact: true,
  });
  await product.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("heading", { name: "Original Vanilla" }),
  ).toBeVisible();
  await expect(dialog).toContainText("Allergens:");
  await dialog.getByRole("button", { name: "Add to my bag" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Original Vanilla added to your bag",
  );
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(product).toBeFocused();
  await expect(page.locator(".bag-count")).toHaveText("1");
});

test("persists the bag, adjusts quantities, and removes items", async ({
  page,
}) => {
  await page
    .getByRole("button", {
      name: "Add Original Vanilla, 6 pieces, to bag",
      exact: true,
    })
    .click();
  await page.reload();
  await expect(page.locator(".bag-count")).toHaveText("1");
  await page.getByRole("button", { name: /Open shopping bag/ }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("button", { name: "Add one Original Vanilla", exact: true })
    .click();
  await expect(dialog.locator(".cart-subtotal strong")).toHaveText("Rp50.000");
  await dialog
    .getByRole("button", { name: "Remove one Original Vanilla", exact: true })
    .click();
  await expect(dialog.locator(".cart-subtotal strong")).toHaveText("Rp25.000");
  await dialog
    .getByRole("button", {
      name: "Remove Original Vanilla from bag",
      exact: true,
    })
    .click();
  await expect(dialog).toContainText("A little empty.");
  await dialog.getByRole("button", { name: /Find your happy flavor/ }).click();
  await expect(dialog).not.toBeVisible();
});

test("adds the selected sharing box at its correct price", async ({ page }) => {
  await page
    .locator(".bundle")
    .filter({ hasText: "The Happy Gathering" })
    .click();
  await expect(page.locator('input[value="box-24"]')).toBeChecked();
  await page.getByRole("button", { name: "Add my happy box" }).click();
  await page.getByRole("button", { name: /Open shopping bag/ }).click();
  await expect(page.getByRole("dialog")).toContainText("The Happy Gathering");
  await expect(page.locator(".cart-subtotal strong")).toHaveText("Rp99.000");
});

test("opens and closes FAQ answers with accessible state", async ({ page }) => {
  const question = page.getByRole("button", {
    name: "Can I mix and match my flavors?",
  });
  await question.click();
  await expect(question).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("region", { name: "Can I mix and match my flavors?" }),
  ).toContainText("Of course.");
  await expect(
    page.getByRole("button", { name: "What exactly is gabin?" }),
  ).toHaveAttribute("aria-expanded", "false");
  await question.click();
  await expect(question).toHaveAttribute("aria-expanded", "false");
});

test("prepares a validated delivery request without claiming payment or order confirmation", async ({
  page,
}) => {
  await page
    .getByRole("button", {
      name: "Add Chocolate Bliss, 6 pieces, to bag",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: /Open shopping bag/ }).click();
  await page
    .getByRole("button", { name: "Prepare my order", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("button", { name: "Prepare my WhatsApp request" })
    .click();
  await expect(
    dialog.getByRole("heading", { name: "A few little details." }),
  ).toBeVisible();
  await dialog.getByLabel("Your name", { exact: true }).fill("Ayu Test");
  await dialog.getByLabel("WhatsApp number", { exact: true }).fill("0       ");
  await dialog
    .getByLabel("Delivery address", { exact: true })
    .fill("Jl. Melati 12, Bandung 40123");
  await dialog
    .getByRole("button", { name: "Prepare my WhatsApp request" })
    .click();
  expect(
    await dialog
      .getByLabel("WhatsApp number", { exact: true })
      .evaluate((input) => !(input as HTMLInputElement).validity.valid),
  ).toBeTruthy();
  await dialog
    .getByLabel("WhatsApp number", { exact: true })
    .fill("0812 3456 7890");
  await dialog
    .getByLabel("A little note", { exact: false })
    .fill("A box to share with my family.");
  await dialog
    .getByRole("button", { name: "Prepare my WhatsApp request" })
    .click();
  await expect(
    dialog.getByRole("heading", { name: /Your order request/ }),
  ).toBeVisible();
  const href = await dialog
    .getByRole("link", { name: /Continue in WhatsApp/ })
    .getAttribute("href");
  const request = new URL(href!).searchParams.get("text");
  expect(request).toContain("1 x Chocolate Bliss");
  expect(request).toContain("Product subtotal: Rp28.000");
  expect(request).toContain("Name: Ayu Test");
  expect(request).toContain("Address: Jl. Melati 12, Bandung 40123");
  await expect(dialog).toContainText("not a confirmed order");
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await dialog
    .getByRole("button", { name: "Copy order request instead" })
    .click();
  await expect(
    dialog.getByRole("button", { name: "Order request copied" }),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "Name: Ayu Test",
  );
  await dialog.getByRole("button", { name: "Edit my details" }).click();
  await expect(dialog.getByLabel("Your name", { exact: true })).toHaveValue(
    "Ayu Test",
  );
  await expect(
    dialog.getByRole("textbox", { name: "Delivery address", exact: true }),
  ).toHaveValue("Jl. Melati 12, Bandung 40123");
  await dialog.getByRole("radio", { name: "I'll pick it up" }).check();
  await expect(
    dialog.getByLabel("Delivery address", { exact: true }),
  ).not.toBeVisible();
  await dialog
    .getByRole("button", { name: "Prepare my WhatsApp request" })
    .click();
  const pickupHref = await dialog
    .getByRole("link", { name: /Continue in WhatsApp/ })
    .getAttribute("href");
  expect(new URL(pickupHref!).searchParams.get("text")).toContain(
    "Fulfillment: Pickup",
  );
});

test("keeps keyboard focus within the bag and closes with Escape", async ({
  page,
}) => {
  const opener = page.getByRole("button", { name: /Open shopping bag/ });
  await opener.click();
  const close = page.getByRole("button", { name: "Close dialog" });
  await expect(close).toBeFocused();
  await close.press("Shift+Tab");
  await expect(
    page
      .getByRole("dialog")
      .getByRole("button", { name: /Find your happy flavor/ }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(opener).toBeFocused();
});

test("supports mobile navigation", async ({ page }) => {
  test.skip((page.viewportSize()?.width || 0) > 640, "Mobile navigation only");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Our flavors" })
    .click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).not.toBeVisible();
  await expect(page).toHaveURL(/#flavors$/);
});

test("passes automated WCAG accessibility checks for the page and checkout", async ({
  page,
}) => {
  for (
    let y = 0;
    y < (await page.evaluate(() => document.body.scrollHeight));
    y += 600
  ) {
    await page.evaluate(
      (top) => window.scrollTo({ top, behavior: "instant" }),
      y,
    );
    await page.waitForTimeout(70);
  }
  await page.waitForTimeout(300);
  const pageResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(
    pageResults.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  await page
    .getByRole("button", {
      name: "Add Original Vanilla, 6 pieces, to bag",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: /Open shopping bag/ }).click();
  const cartResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    cartResults.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  await page
    .getByRole("button", { name: "Prepare my order", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "A few little details." }),
  ).toBeVisible();
  const checkoutResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    checkoutResults.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
});
