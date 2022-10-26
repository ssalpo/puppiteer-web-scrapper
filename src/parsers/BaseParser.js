import md5 from "md5";

export default class BaseParser {
    page = null;
    url = null;

    setPage(page) {
        this.page = page;

        return this;
    }

    setUrl(url) {
        this.url = url;

        return this;
    }

    addUniqueId(item) {
        return {...item, uniqId: md5([item.author, item.date, item.rating].join(''))}
    }
}
