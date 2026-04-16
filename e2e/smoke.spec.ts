import { expect, test } from "@playwright/test";

/** JWT đặt trong env khi chạy: E2E_TOKEN=... npx playwright test */
const token = process.env.E2E_TOKEN;

const ADMIN_PATHS = [
  "/dashboard-admin",
  "/admin-obe-dashboard",
  "/don-vi",
  "/nien-khoa",
  "/giang-vien",
  "/sinh-vien",
  "/tai-khoan",
  "/chuong-trinh-dao-tao",
  "/chuong-trinh-nien-khoa",
  "/hoc-phan",
  "/chuong-trinh-dao-tao-hoc-phan",
  "/de-cuong-chi-tiet",
  "/cach-danh-gia",
  "/lop-hoc-phan",
  "/dang-ky-hoc-phan",
  "/phan-cong-de-cuong",
  "/diem-so",
  "/plo",
  "/clo",
  "/co",
  "/clo-plo-matrix",
  "/co-clo-matrix",
  "/cdg-co-matrix",
  "/cau-hinh-obe",
] as const;

const LECTURE_PATHS = [
  "/dashboard-lecture",
  "/nhap-de-cuong",
  "/de-cuong-lecture",
  "/diem-so-lecture",
  "/plo-lecture",
  "/clo-lecture",
  "/co-lecture",
  "/cdg-co-matrix-lecture",
  "/co-clo-matrix-lecture",
  "/clo-plo-matrix-lecture",
] as const;

async function injectToken(page: import("@playwright/test").Page, jwt: string) {
  await page.addInitScript((t) => {
    localStorage.setItem("token", t);
  }, jwt);
}

test.describe("public", () => {
  test.use({
    viewport: { width: 1280, height: 720 },
    colorScheme: "light",
  });

  test("trang chủ chuyển hướng tới đăng nhập", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("trang đăng nhập hiển thị tiêu đề", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
    await expect(page.getByRole("button", { name: /đăng nhập/i })).toBeVisible();
  });

  test("trang đăng ký mở được", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page).toHaveURL(/\/sign-up/);
  });
});

test.describe("admin — smoke từng route", () => {
  test.use({
    viewport: { width: 1280, height: 720 },
    colorScheme: "light",
  });

  test.beforeEach(async ({ page }) => {
    test.skip(!token, "Thiếu E2E_TOKEN — bỏ qua smoke admin");
    await injectToken(page, token!);
  });

  for (const path of ADMIN_PATHS) {
    test(`GET UI ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator(".ant-layout")).toBeVisible();
      await expect(page.getByText("OBE Admin", { exact: true })).toBeVisible();
    });
  }
});

test.describe("lecture — smoke từng route", () => {
  test.use({
    viewport: { width: 1280, height: 720 },
    colorScheme: "light",
  });

  test.beforeEach(async ({ page }) => {
    test.skip(!token, "Thiếu E2E_TOKEN — bỏ qua smoke lecture");
    await injectToken(page, token!);
  });

  for (const path of LECTURE_PATHS) {
    test(`GET UI ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator(".ant-layout")).toBeVisible();
    });
  }
});