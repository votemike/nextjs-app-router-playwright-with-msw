// @ts-nocheck
import {Page, test as base} from "@playwright/test";
import {createServer, Server} from "http";
import {AddressInfo} from "net";
import next from "next";
import path from "path";
import {parse} from "url";
import * as json from "../.next/prerender-manifest.json";
import {setupServer, SetupServerApi} from "msw/node";

export const test = base.extend<{ dynamicPage: Page, port: string, requestInterceptor: SetupServerApi }>({
  dynamicPage: async ({context}, use) => {
    await context.addCookies([{
      name: '__prerender_bypass',
      value: json.preview.previewModeId,
      domain: 'localhost',
      path: '/'
    }]);

    const dynamicPage = await context.newPage();
    await use(dynamicPage);
  },
  port: [
    async ({}, use) => {
      const app = next({dev: false, dir: path.resolve(__dirname, "..")});
      await app.prepare();

      const handle = app.getRequestHandler();

      const server: Server = await new Promise(resolve => {
        const server = createServer((req, res) => {
          const parsedUrl = parse(req.url, true);
          handle(req, res, parsedUrl);
        });

        server.listen((error) => {
          if (error) throw error;
          resolve(server);
        });
      });
      const port = String((server.address() as AddressInfo).port);
      await use(port);
    },
    {
      scope: "worker",
      auto: true
    }
  ],
  requestInterceptor: [
    async ({}, use) => {
      await use((() => {
        const requestInterceptor = setupServer();

        requestInterceptor.listen({
          onUnhandledRequest: "bypass"
        });

        return requestInterceptor
      })());
    },
    {
      scope: "worker"
    }
  ]
});
