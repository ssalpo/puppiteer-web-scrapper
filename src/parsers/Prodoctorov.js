import BaseParser from "./BaseParser.js";
import {delay} from "../../utils/index.js";
import ApiService from "../ApiService.js";

export default class Prodoctorov extends BaseParser {
    async parse(branchPlatformId) {
        await this.page.waitForSelector('[data-qa="show_more_list_items"]');

        while (await this.getTotalCount() > await this.getCurrentListCount()) {
            await this.clickToShowMore();
        }

        let reviews = (await this.getReviews()).map(e => this.addUniqueId(e, [e.author, e.date].join(), true));

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
            '.b-review-card[data-review-id]:not(.d-none)',
            reviews => reviews.map(
                review => ({
                    author: JSON.parse(review.querySelector('[data-patient-data]')?.getAttribute('data-patient-data') || null)?.patientTitle,
                    date: review.querySelector('[itemprop="datePublished"]')?.getAttribute('content'),
                    rating: Math.floor(parseFloat(review.querySelector('[itemprop="ratingValue"]')?.content ?? 0) / 20),
                    text: review.querySelector('.b-review-card__comments')?.textContent.trim(),
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
        return await this.page.$eval('[data-anchor-target="otzivi"] .b-doctor-details__toc-num', (item) => parseInt(item.textContent));
    }

    /**
     * Возвращает общее количество отзывов на основе списка отзывов
     *
     * @returns {Promise<*>}
     */
    async getCurrentListCount() {
        return await this.page.$$eval('.b-review-card[data-review-id]', reviews => reviews.length);
    }

    /**
     * Производит клик по кнопке показать еще
     *
     * @returns {Promise<void>}
     */
    async clickToShowMore() {
        let canClick = await this.page.click('[data-qa="show_more_list_items"] span').then(() => true).catch(() => false);

        if (!canClick) return;

        await this.page.click('[data-qa="show_more_list_items"] span');

        await delay(1000);
    }
}
