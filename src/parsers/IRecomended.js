import BaseParser from "./BaseParser.js";
import ApiService from "../ApiService.js";
import {format, parse} from "date-fns";

export default class IRecomended extends BaseParser {
    async parse(branchPlatformId) {
        let clinicSlug = this.url.split('/').pop();

        await this.page.waitForSelector('.list-comments .item.last');

        let i = 0;
        let lastPage = await this.getLastPage();
        let reviews = [];

        while (i < lastPage) {
            if (i > 0) {
                await this.page.click(`.pager a[href='/content/${clinicSlug}?page=${i}']`)
                await this.page.waitForSelector('.list-comments .item.last');
            }

            reviews = reviews.concat(await this.getReviews());
            i++;
        }

        reviews = reviews.map(e => {
            return {
                ...this.addUniqueId(e),
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
     * Получает номер последней страницы
     *
     * @returns {Promise<*>}
     */
    async getLastPage() {
        return await this.page.$eval('.pager .pager-last', (item) => parseInt(item.textContent));
    }

    /**
     * Возвращает список отзывов на странице
     *
     * @returns {Promise<*>}
     */
    async getReviews() {
        return await this.page.$$eval(
            'ul.list-comments li.item .reviews-list-item',
            reviews => reviews.map(
                review => ({
                    author: review.querySelector('.authorName')?.textContent.trim(),
                    date: review.querySelector('.created')?.textContent.trim(),
                    rating: review.querySelectorAll('.starsRating .on').length,
                    text: review.querySelector('.reviewTeaserText')?.textContent,
                })
            )
        );
    }
}
