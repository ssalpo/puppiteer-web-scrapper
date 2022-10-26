import BaseParser from "./BaseParser.js";
import {delay, pageScreenshot} from "../../utils/index.js";
import fs from "fs";
import ApiService from "../ApiService.js";

export default class TwoGis extends BaseParser {
    classMap = {}

    constructor() {
        super();

        this.classMap = JSON.parse(fs.readFileSync('./classMapping/2gis-classmap.json'))
    }

    async parse(branchPlatformId) {
        while (await this.showMoreClass()) {
            await this.clickToShowMoreBtn(await this.showMoreClass());
        }

        await this.collapseAllComments();

        console.log('all collapsed')

        await pageScreenshot(this.page);

        let reviews = (await this.getReviews()).map(e => this.addUniqueId(e, [e.author, e.date, e.rating].join()));

        if (reviews.length && branchPlatformId) {
            await (new ApiService).importReviews(
                branchPlatformId, reviews
            )
        }
    }

    /**
     * Возвращает название класса кнопки Загрузить еще
     *
     * @returns {Promise<*>}
     */
    async showMoreClass() {
        return await this.page.$eval(
            `.${this.classMap.mainBlockClass}`,
            review => {
                let filteredButtons = [...review.parentNode.querySelectorAll('button')]
                    .filter(el => el.textContent === 'Загрузить ещё');

                return filteredButtons.length ? filteredButtons[0].classList.value : null
            }
        );
    }

    /**
     * Кликает по кнопке по кнопке показать еще
     *
     * @param showMoreEl
     * @returns {Promise<void>}
     */
    async clickToShowMoreBtn(showMoreEl) {
        if (!showMoreEl) return;

        await this.page.click(`.${showMoreEl}`);

        await delay(2000);
    }

    /**
     * Раскрывает блок Читать целиком
     *
     * @returns {Promise<void>}
     */
    async collapseAllComments() {
        await this.page.$$eval(`.${this.classMap.commentReadAllClass}`, elHandles => elHandles.forEach(el => el.click()));
    }

    /**
     * Возвращает список отзывов на странице
     *
     * @returns {Promise<*>}
     */
    async getReviews() {
        return await this.page.$$eval(
            `.${this.classMap.mainBlockClass}`,
            (reviews, classMap) => reviews.map(
                review => ({
                    author: review.querySelector(`.${classMap.nameClass}`)?.textContent.trim(),
                    date: review.querySelector(`.${classMap.dateClass}`)?.textContent.trim().replace(', отредактирован', ''),
                    rating: review.querySelectorAll(`.${classMap.ratingClass} span`).length,
                    text: review.querySelector(`.${classMap.commentClass}`)?.textContent,
                })
            ),
            this.classMap
        );
    }
}
