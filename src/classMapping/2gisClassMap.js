import {openPage, delay} from "../../utils/index.js";
import fs from 'fs';

let url = 'https://2gis.ru/novosibirsk/search/%D0%9A%D0%B2%D0%B0%D1%80%D1%82%D0%B8%D1%80%D0%BD%D1%8B%D0%B5%20%D0%B1%D1%8E%D1%80%D0%BE/rubricId/19487/firm/70000001063753077/82.99472%2C55.050942/tab/reviews';

await openPage(
    url,
    async (page, browser) => {
        await delay(10000);

        let classList = await page.evaluate(() => {
            function findElementByText(tag, text) {
                let xpath = `//${tag}[text()='${text}']`;

                return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
            }

            let dateEl = findElementByText('div', '3 октября 2022');

            let dateClass = dateEl.classList.value

            let mainBlockClass = dateEl.parentNode.parentNode.parentNode.parentNode.parentNode.classList.value;

            let ratingClass = document.querySelector(`.${mainBlockClass} svg[fill="#ffb81c"]`).parentNode.parentNode.classList.value

            let nameClass = findElementByText('span', 'Валерия Токарева').classList.value;

            let commentClass = findElementByText('a', 'Отличные апартаменты 👍👍👍').classList.value;

            let commentReadAllClass = findElementByText('span', 'Читать целиком').classList.value;

            return {
                dateClass,
                mainBlockClass,
                ratingClass,
                nameClass,
                commentClass,
                commentReadAllClass,
            }
        })

        fs.readFile('./classMapping/2gis-classmap.json', 'utf8', (err, data) => {
            fs.writeFile('./classMapping/2gis-classmap.json', JSON.stringify(classList, null, 2), (err, result) => {
                if (err) console.log('error', err);
            });
        });
    }
)
