import puppeteer, {Browser} from "puppeteer";
import {Buffer} from "node:buffer";

const createScreenshotUrl = () => {
    let browserCache: undefined | Browser;
    const initializeBrowser = async (): Promise<Browser> => {
        if (!browserCache) {
            browserCache = await puppeteer.launch({ defaultViewport: { width: 1280, height: 720 } });
        }

        return browserCache;
    };

    return {
        screenshot: async ({url, type}: {url: URL, type: 'png' | 'jpeg' | 'webp'}): Promise<Buffer> => {
            const browser = await initializeBrowser();

            const page = await browser.newPage();

            page.goto(url.toString()).catch((err: Error) => console.error('Failed to redirect page', {err}));

            try {
                await page.waitForNetworkIdle({idleTime: 250, timeout: 1000 * 10 /* ms > s */ });
            } catch (error) {
                console.error('Screenshot timed out');
            }

            try {
                const screenshot = await page.screenshot({fullPage: true, optimizeForSpeed: true, type});

                return Buffer.from(screenshot);
            } finally {
                page.close().catch((err: Error) => console.error('Failed to close the page', {err}));
            }
        }
    }
}

export const screenshotUrl = createScreenshotUrl();