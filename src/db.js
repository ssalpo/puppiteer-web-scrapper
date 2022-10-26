import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

let instance = null;
let db = null;

export default class DB {
    static async getInstance() {
        if (!instance) {
            let connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE
            })

            console.log('connecting to db...');

            await connection.connect();

            db = connection;
            instance = new DB();

            return instance;
        }

        return instance;
    }

    async getRandomProxy() {
        let [proxies] = await db.query('SELECT * FROM proxies ORDER BY RAND() LIMIT 1');

        return proxies[0] ? {
            url: proxies[0].name,
            auth: {username: proxies[0].login, password: proxies[0].password},
        } : null
    }

    async closeConnection() {
        console.log('closing db connection...')

        await db.end();
    }
};

