import { test, expect } from '@playwright/test';

test.describe('Torrent Streamer E2E', () => {
  test('should display the landing page', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /Torrent & HLS Streamer/i })).toBeVisible();
    await expect(page.getByText(/Stream torrents and HLS playlists/i)).toBeVisible();
  });

  test('should show validation error for invalid input', async ({ page }) => {
    await page.goto('/');

    const input = page.getByLabel(/Magnet Link or HLS Playlist URL/i);
    const submitButton = page.getByRole('button', { name: /Stream/i });

    await input.fill('invalid-input');
    await submitButton.click();

    await expect(page.getByRole('alert')).toContainText(/Please enter a valid magnet link/i);
  });

  test('should show legal notice on landing page', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText(/Legal Notice/i)).toBeVisible();
    await expect(page.getByText(/Only use this tool with content you have the right to access/i)).toBeVisible();
  });

  test('should have paste button', async ({ page }) => {
    await page.goto('/');

    const pasteButton = page.getByRole('button', { name: /Paste/i });
    await expect(pasteButton).toBeVisible();
  });
});
