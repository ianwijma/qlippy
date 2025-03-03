import {protocol, nativeImage} from 'electron'
// @ts-ignore
import puppeteer from "puppeteer";

export const siteProtocol = (() => {
    const protocolName = "site";

    protocol.registerSchemesAsPrivileged([
        { scheme: protocolName, privileges: { bypassCSP: true } },
    ]);

    return {
        initialize: async () => {
            const browser = await puppeteer.launch({ defaultViewport: { width: 1280, height: 720 } });

            protocol.handle(protocolName, async (request) => {
                try {
                    const { pathname } = new URL(request.url);
                    const url = `https://${pathname.substring('//'.length)}`;

                    console.time('site');

                    const page = await browser.newPage();
                    console.timeLog('site', 'new');

                    page.goto(url).catch(console.error);
                    console.timeLog('site', 'goto');

                    await page.waitForNetworkIdle({idleTime: 250, timeout: 0});
                    console.timeLog('site', 'idle');

                    const screenshot = await page.screenshot({fullPage: true});
                    console.timeLog('site', 'screenshot');

                    await page.close()
                    console.timeLog('site', 'closed');

                    const response = new Response(Buffer.from(screenshot));
                    console.timeEnd('site');

                    return response;
                } catch (error) {
                    // Handle the error as needed
                    console.error(error);
                }
            });
        }
    }
})();