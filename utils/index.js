export function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

export async function elExists(page, selector) {
    return await page.$eval(selector, () => true).catch(() => false)
}

export async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            let distance = 3000;
            let timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

export async function pageScreenshot(page, name) {
    await page.screenshot({path: name || 'example.png', fullPage: true});
}
