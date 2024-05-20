const loginWith = async (page, username, password) => {
  await page.getByRole('button', { name: 'log in' }).click();
  await page.getByTestId('username').fill(username);
  await page.getByTestId('password').fill(password);
  await page.getByRole('button', { name: 'login' }).click();
};

const createNote = async (page, content, importance) => {
  await page.getByRole('button', { name: 'new note' }).click();
  await page.getByTestId('note').fill(content);

  if (importance) {
    await page.getByTestId('important').click();
  }

  await page.getByRole('button', { name: 'Add' }).click();
  await page.getByText(content).waitFor();
};

module.exports = { loginWith, createNote };
