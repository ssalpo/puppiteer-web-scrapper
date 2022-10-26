import axios from 'axios';

export default class ApiService {
    async getPlatforms() {
        return await axios.get(`${process.env.BACKEND_URL}/parsers/platforms`)
    }

    async importReviews(branchPlatformId, reviews) {
        try {
            await axios.post(`${process.env.BACKEND_URL}/parsers/import`, {
                branchPlatformId, reviews
            })
        } catch (e) {
            console.log(e.response)
        }
    }

    getProxies() {
    }
}
