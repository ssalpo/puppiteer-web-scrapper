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

    addUniqueId(item, uniqValues, substr) {
        let hash = md5(uniqValues)
        return {...item, uniqId: substr ? hash.substring(0, 8): hash}
    }
}
