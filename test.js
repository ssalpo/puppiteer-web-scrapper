import puppeteer from 'puppeteer';
// import useProxy from 'puppeteer-page-proxy';
import axios from "axios";

(async () => {
    const browser = await puppeteer.launch({
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
            '--ignore-certificate-errors',
            '--proxy-server=http://162.19.131.146:10455'
        ]
    });

    await axios.get(`https://astroproxy.com/api/v1/ports/3039472/newip?token=1e56d7afcc2410b6&id=3039472`)

    const page = await browser.newPage();

    await page.authenticate({
        username: 'ssalpomishevich1709',
        password: '9b2ffd'
    })

    // await useProxy({
    //     page,
    //     proxyUrl: 'http://ssalpomishevich1709:9b2ffd@51.77.79.249:10885',
    // });

    await page.goto('https://yandex.ru/maps/org/lyogkaya_stomatologiya/43654671641/reviews/?ll=37.587713%2C55.691465&z=17');

    await page.screenshot({                      // Screenshot the website using defined options
        path: "./screenshot.png",                   // Save the screenshot in current directory
        fullPage: true                              // take a fullpage screenshot
    });

    await page.setRequestInterception(true);
    await page.on('request', (req) => {
        if (req.resourceType() === 'stylesheet' || req.resourceType() === 'font' || req.resourceType() === 'image') {
            req.abort();
        } else {
            req.continue();
        }
    })


    await page.close();                           // Close the website

    await browser.close();
})();
