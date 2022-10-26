import {autoScroll, delay} from "../../utils/index.js";
import BaseParser from "./BaseParser.js";
import ApiService from "../ApiService.js";
import {format, parseISO} from 'date-fns'

export default class Zoon extends BaseParser {
    async parse(branchPlatformId) {
        await this.page.waitForSelector('.reviews-top-panel .service-block-title');

        while (await this.getTotalCount() > await this.getCurrentListCount()) {
            await this.clickToShowMore();
        }

        let reviews = (await this.getReviews()).map(e => {
            return {
                ...this.addUniqueId(e, [e.author, e.date].join()),
                date: format(parseISO(e.date), 'yyyy-MM-dd')
            }
        });

        if (reviews.length && branchPlatformId) {
            await (new ApiService).importReviews(
                branchPlatformId, reviews
            )
        }
    }

    /**
     * Возвращает список отзывов на странице
     *
     * @returns {Promise<*>}
     */
    async getReviews() {
        return await this.page.$$eval(
            '.comments-section ul.js-comment-list > .js-comment[data-type="comment"] > div.js-comment-container',
            reviews => reviews.map(
                review => ({
                    author: review.querySelector('[itemprop="author"]')?.textContent.trim(),
                    date: review.querySelector('[itemprop="datePublished"]')?.getAttribute('content'),
                    rating: parseFloat(review.querySelector('span.stars-rating-text')?.textContent ?? 0),
                    text: review.querySelector('[itemprop="text"] .js-comment-content')?.textContent,
                })
            )
        );
    }

    /**
     * Возвращает общее количество отзывов
     *
     * @returns {Promise<*>}
     */
    async getTotalCount() {
        return await this.page.$eval('.reviews-top-panel .service-block-title', (item) => parseInt(item.textContent.replace(/\D/g, "")));
    }

    /**
     * Возвращает общее количество отзывов на основе списка отзывов
     *
     * @returns {Promise<*>}
     */
    async getCurrentListCount() {
        return await this.page.$$eval('.comments-section ul.js-comment-list > .js-comment[data-type="comment"] > div.js-comment-container', reviews => reviews.length);
    }

    /**
     * Производит клик по кнопке показать еще
     *
     * @param page
     * @returns {Promise<void>}
     */
    async clickToShowMore() {
        await autoScroll(this.page);

        let canClick = await this.page.click('.js-show-more-box .js-show-more').then(() => true).catch(() => false);

        if (!canClick) return;

        await this.page.waitForSelector('.js-show-more-box .js-show-more');

        await delay(3000);
    }
}
