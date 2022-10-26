import BaseParser from "./BaseParser.js";
import {delay, elExists} from "../../utils/index.js";
import ApiService from "../ApiService.js";
import {format, parse} from "date-fns";

export default class Otzovik extends BaseParser {
    async parse(branchPlatformId) {
        let sort = '?order=date_desc';
        this.url = this.url.replace('?order=date_desc', '');

        await this.waitForItemVisible();

        let lastPage = await this.getLastPage();
        let reviews = await this.getReviews();
        let currentPageIndex = 2;

        while (currentPageIndex <= lastPage) {
            await this.page.goto(this.url + currentPageIndex + sort);

            await this.waitForItemVisible();

            reviews = [...reviews, ...(await this.getReviews())];

            currentPageIndex++;

            await delay(2000);
        }

        reviews = reviews.map(e => {
            return {
                ...this.addUniqueId(e, [e.author, e.date].join()),
                date: format(parse(e.date, 'dd.MM.yyyy', new Date()), 'yyyy.MM.dd')
            }
        });

        if (reviews.length && branchPlatformId) {
            await (new ApiService).importReviews(
                branchPlatformId, reviews
            )
        }
    }

    /**
     * Ожидает появление элемента в DOM
     *
     * @returns {Promise<void>}
     */
    async waitForItemVisible() {
        await this.page.waitForSelector('.review-list-chunk .item', {visible: true});
    }

    /**
     * Возвращает список отзывов на странице
     *
     * @returns {Promise<*>}
     */
    async getReviews() {
        return await this.page.$$eval(
            '.review-list-chunk .item',
            reviews => reviews.map(
                review => {
                    let {plus, minus, teaser} = {
                        plus: review.querySelector('.review-plus')?.textContent,
                        minus: review.querySelector('.review-minus')?.textContent,
                        teaser: review.querySelector('.review-teaser')?.textContent,
                    };

                    let text = `${plus} \n ${minus} \n ${teaser}`;

                    return {
                        author: review.querySelector('.user-info span[itemprop=name]')?.textContent.trim(),
                        date: review.querySelector('[itemprop="datePublished"]')?.textContent.trim(),
                        rating: parseInt(review.querySelector('span[itemprop="reviewRating"] meta[itemprop="ratingValue"]')?.getAttribute('content') || 0),
                        text
                    }
                }
            )
        );
    }

    /**
     * Получает номер последней страницы
     *
     * @returns {Promise<number|*>}
     */
    async getLastPage() {
        if (!(await elExists(this.page, 'div.pager'))) return 0;

        if (await elExists(this.page, 'div.pager .pager-item.last')) {
            return await this.page.$eval('div.pager .pager-item.last', pager => parseInt(pager.getAttribute('title').replace(/\D/g, "")));
        } else {
            return await this.page.$eval('div.pager .pager-item:nth-last-child(2)', pager => parseInt(pager.textContent));
        }
    }
}
