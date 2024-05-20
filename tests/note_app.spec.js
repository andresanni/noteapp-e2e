const { test, expect, describe, beforeEach } = require('@playwright/test');
const helper = require('./helper');

describe('Note app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset');
    await request.post('/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukai',
        password: 'salainen',
      },
    });
    await page.goto('/');
  });

  test('front page can be opened', async ({ page }) => {
    const locator = await page.getByText('Notes');
    await expect(locator).toBeVisible();
    await expect(
      page.getByText(
        'Note app, Department of Computer Science, University of Helsinki 2024'
      )
    ).toBeVisible();
  });

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await helper.loginWith(page, 'mluukai', 'salainen');
    });

    test('a new note can be created', async ({ page }) => {
      await helper.createNote(page, 'new note from playwright');

      await expect(page.getByText('new note from playwright')).toBeVisible();
    });

    describe('and three notes exists', () => {
      beforeEach(async ({ page }) => {
        await helper.createNote(page, 'first note', true);
        await helper.createNote(page, 'second note', true);
        await helper.createNote(page, 'third note', true);
      });

      test('second note importance can be changed', async ({ page }) => {
        const secondNoteElement = await page.getByText('second note');
        const secondNoteElementFather = await secondNoteElement.locator('..');
        await secondNoteElementFather
          .getByRole('button', { name: 'Make not important' })
          .click();

        await expect(
          secondNoteElementFather.getByRole('button', {
            name: 'Make important',
          })
        ).toBeVisible();
      });
    });
  });

  test('login fails with wrong password', async ({ page }) => {
    await helper.loginWith(page, 'mluukai', 'wrong');
    const errorDiv = await page.locator('.error');

    await expect(errorDiv).toContainText('Wrong credentials');

    // await expect(errorDiv).toHaveCSS('border-style', 'solid');
    // await expect(errorDiv).toHaveCSS('color', 'rgb(255,0,0)');
    const borderStyle = await errorDiv.evaluate((element) => {
      const styleObject = window.getComputedStyle(element);
      return styleObject.border;
    });
    await expect(borderStyle).toBe('3px solid rgb(255, 0, 0)');

    await expect(
      page.getByText('Matti Luukkainen logged in')
    ).not.toBeVisible();
  });
});
