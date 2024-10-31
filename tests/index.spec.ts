import {expect, test} from "@playwright/test";

test("Bulbasaur", async ({page}) => {
  await page.goto(`http://localhost:3000/`);
  const name = await page.innerText('h1');
  expect(name).toBe('bulbasaur');
});
