import DB from "./db.js";
import ClusterParser from "./Puppeteer/ClusterParser.js";
import ApiService from "./ApiService.js";




// let api = new ApiService();
//
// let {data: groupedUrls} = await api.getPlatforms();

let groupedUrls = [
    {
        url: `file://${process.cwd()}/test-pages/index.html`,
        branch_platform_id: 1,
        platform: 'zoon'
    },
    {
        url: `file://${process.cwd()}/test-pages/index.html`,
        branch_platform_id: 1,
        platform: 'yandex'
    },
    {
        url: `file://${process.cwd()}/test-pages/index.html`,
        branch_platform_id: 1,
        platform: 'twoGis'
    },
    {
        url: `file://${process.cwd()}/test-pages/index.html`,
        branch_platform_id: 1,
        platform: 'prodoctorov'
    },
    {
        url: `file://${process.cwd()}/test-pages/index.html`,
        branch_platform_id: 1,
        platform: 'otzovik'
    },
    {
        url: `file://${process.cwd()}/test-pages/index.html`,
        branch_platform_id: 1,
        platform: 'iRecomended'
    },
];

await (new ClusterParser()).work(groupedUrls, groupedUrls[0]?.length ?? 6);

await (await DB.getInstance()).closeConnection();
