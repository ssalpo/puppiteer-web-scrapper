import DB from "./db.js";
import ClusterParser from "./Puppeteer/ClusterParser.js";
import ApiService from "./ApiService.js";

let api = new ApiService();

let {data: groupedUrls} = await api.getPlatforms();

await (new ClusterParser()).work(groupedUrls, groupedUrls[0]?.length ?? 6);

await (await DB.getInstance()).closeConnection();
