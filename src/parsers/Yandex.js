import BaseParser from "./BaseParser.js";
import {delay, pageScreenshot} from "../../utils/index.js";
import ApiService from "../ApiService.js";
import {format, parseISO} from "date-fns";

export default class Yandex extends BaseParser {
    async parse(branchPlatformId) {
        let totalReviews = await this.getTotalReviews();

        console.log('Yandex parser run...')

        await pageScreenshot(this.page);

        await this.page.waitForSelector('.card-section-header__title._wide');

        console.log('Sort by date...');

        await this.sortByNewDate();

        while (totalReviews > await this.getCurrentReviewsCount()) {
            console.log(totalReviews, await this.getCurrentReviewsCount())

            await this.scrollToEnd();

            await pageScreenshot(this.page);
        }

        let reviews = (await this.getReviews()).map(e => {
            return {
                ...this.addUniqueId(e, [e.author, e.date, e.rating].join()),
                date: format(parseISO(e.date), 'yyyy-MM-dd')
            }
        });

        console.log(reviews);

        // if (reviews.length && branchPlatformId) {
        //     await (new ApiService).importReviews(
        //         branchPlatformId, reviews
        //     )
        // }
    }

    /**
     * Сортирует отзывы по дате
     *
     * @returns {Promise<void>}
     */
    async sortByNewDate() {
        await this.page.evaluate(() => {
            document.querySelector('div.rating-ranking-view').click();
        });

        await delay(500)

        await this.page.evaluate(() => {
            document.querySelector('div.rating-ranking-view__popup div.rating-ranking-view__popup-line:nth-child(2)').click();
        });

        await delay(3000);
    }

    /**
     * Производит скрол до конца блока, чтобы подгрузить все отзывы
     *
     * @returns {Promise<void>}
     */
    async scrollToEnd() {
        await this.page.evaluate(() => {
            document.querySelector('.scroll__container').scrollTop = 20000
        });

        await delay(10000);
    }

    /**
     * Возвращает общее количество отзывов
     *
     * @returns {Promise<*>}
     */
    async getTotalReviews() {
        return await this.page.$eval('h2.card-section-header__title', el => parseFloat(el?.textContent.replace(/\D/g, "") || 0))
    }

    /**
     * Возвращает весь список отзывов
     *
     * @returns {Promise<*>}
     */
    async getReviews() {
        return await this.page.$$eval(
            `div.business-reviews-card-view__review`,
            (reviews) => reviews.map(
                review => ({
                    author: review.querySelector('span[itemprop=name]')?.textContent.trim(),
                    date: review.querySelector('meta[itemprop="datePublished"]')?.getAttribute('content'),
                    rating: parseFloat(review.querySelector('[itemprop="reviewRating"] meta[itemprop="ratingValue"]')?.getAttribute('content') || 0),
                    text: review.querySelector('[itemprop="reviewBody"]')?.textContent,
                })
            )
        );
    }

    /**
     * Возвращает общее количество отзывов на основе списка
     *
     * @returns {Promise<*>}
     */
    async getCurrentReviewsCount() {
        return await this.page.$$eval('div.business-reviews-card-view__review', e => e.length);
    }
}
