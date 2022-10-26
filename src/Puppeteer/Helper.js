export default class Helper {
    page = null;

    setPage(page) {
        this.page = page
    }

    async elExists(selector) {
        return await this.page.$(selector) !== null
    }

    async pageScreenshot(path) {
        await this.page.screenshot({path: path || 'screen.png', fullPage: true})
    }

    async scrollToEnd() {
        await this.page.evaluate(() => {
            document.querySelector('.scroll__container').scrollTop = 20000
        });
    }
}
