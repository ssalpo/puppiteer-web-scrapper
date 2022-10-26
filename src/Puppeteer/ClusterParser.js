import {Cluster} from "puppeteer-cluster";
import vanillaPuppeteer from "puppeteer";

import {addExtra} from "puppeteer-extra";
import Stealth from "puppeteer-extra-plugin-stealth";
import AnonymizeUa from "puppeteer-extra-plugin-anonymize-ua";
import DB from "../db.js";

export default class ClusterParser {
    proxy = null;

    async puppeteerOptions() {
        let options = {
            ignoreDefaultArgs: [
                "--disable-extensions",
                "--enable-automation"
            ],
            args: [
                '--autoplay-policy=user-gesture-required',
                '--disable-background-networking',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-breakpad',
                '--disable-client-side-phishing-detection',
                '--disable-component-update',
                '--disable-default-apps',
                '--disable-dev-shm-usage',
                '--disable-domain-reliability',
                '--disable-features=AudioServiceOutOfProcess',
                '--disable-hang-monitor',
                '--disable-ipc-flooding-protection',
                '--disable-notifications',
                '--disable-offer-store-unmasked-wallet-cards',
                '--disable-popup-blocking',
                '--disable-print-preview',
                '--disable-prompt-on-repost',
                '--disable-renderer-backgrounding',
                '--disable-setuid-sandbox',
                '--disable-speech-api',
                '--disable-sync',
                '--hide-scrollbars',
                '--ignore-gpu-blacklist',
                '--metrics-recording-only',
                '--mute-audio',
                '--no-default-browser-check',
                '--no-first-run',
                '--no-pings',
                '--no-sandbox',
                '--no-zygote',
                '--password-store=basic',
                '--use-gl=swiftshader',
                '--use-mock-keychain',
                '--lang=en-US,en;q=0.9',
                '--ignore-certificate-errors'
            ]
        }

        if (this.proxy !== null) {
            options.args.push(`--proxy-server=${this.proxy.url}`);
        }

        return options
    }

    async proxyAuth(page) {
        if (!this.proxy) return;

        await page.authenticate(this.proxy.auth);
    }

    async getParser(name) {
        // zoon => Zoon ....
        name = name[0].toUpperCase() + name.slice(1);

        let parser = (await import(`../parsers/${name}.js`)).default;

        return new parser();
    }

    async work(groupedUrls, maxConcurrency) {
        if (!groupedUrls.length) return;

        this.proxy = await (await DB.getInstance()).getRandomProxy();

        const puppeteer = addExtra(vanillaPuppeteer);

        puppeteer.use(Stealth());
        puppeteer.use(AnonymizeUa());

        let puppeteerOptions = this.puppeteerOptions()

        const cluster = await Cluster.launch({
            puppeteer,
            puppeteerOptions,
            maxConcurrency,
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            monitor: true,
            timeout: 300000
        });

        cluster.on('taskerror', (err, data, willRetry) => {
            console.log(err);

            if (willRetry) {
                console.warn(`Encountered an error while crawling ${data}. ${err.message}\nThis job will be retried`);
            } else {
                console.error(`Failed to crawl ${data}: ${err.message}`);
            }
        });

        for (let urls of groupedUrls) {
            for (let item of urls) {

                item['parser'] = await this.getParser(item.platform);

                await cluster.queue(item.url, async ({page, data: url}) => {
                    await this.proxyAuth(page);

                    await page.goto(url);

                    await item.parser
                        .setPage(page)
                        .setUrl(url)
                        .parse(item['branch_platform_id']);
                });
            }
        }

        await cluster.idle();
        await cluster.close();
    }
}
