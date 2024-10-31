import {expect} from "@playwright/test";
import {http, HttpResponse} from "msw";
import {test} from './fixture';

test("Bulbasaur", async ({dynamicPage, port, requestInterceptor}) => {
  requestInterceptor.use(http.get('https://pokeapi.co/api/v2/pokemon/bulbasaur', () => {
    return HttpResponse.json({name: 'squirtle'})
  }));

  await dynamicPage.goto(`http://localhost:${port}/`);
  const name = await dynamicPage.innerText('h1');
  expect(name).toBe('squirtle');
});
