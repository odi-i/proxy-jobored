import express from 'express'
import proxy from 'express-http-proxy';
import * as dotenv from 'dotenv'
import requestIp from 'request-ip';
import cors from 'cors';
import {LRUCache} from "lru-cache";
dotenv.config()

const app = express();
const port = process.env.PORT || 3001;

const cookiePerIP = new LRUCache({
    max: 1000,
    ttl: 1000 * 60 * 3,
    updateAgeOnGet: false,
    updateAgeOnHas: false,
});

app.use(cors({
    origin: true,
}));

app.use(requestIp.mw());

//@ts-ignore
app.use('/', proxy(process.env.ORIGINAL_SERVER_URL, {
    https: true,
    userResHeaderDecorator(headers, userReq,) {
        const key = userReq.clientIp;

        if (headers['set-cookie']) {
            const newCookies = headers['set-cookie'].map(c => {
                const [key, value] = c.split(';')[0].split('=');
                return {key, value};
            });
//@ts-ignore
            const previousCookies = cookiePerIP.get(key) || [];
            //@ts-ignore
            const currentCookies = previousCookies.concat(newCookies);
//@ts-ignore
            cookiePerIP.set(key, currentCookies);
        }

        return headers;
    },
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
        const key = srcReq.clientIp;
//@ts-ignore
        if (cookiePerIP.has(key)) {
            //@ts-ignore
            const cookies = cookiePerIP
                //@ts-ignore
                .get(key)
                //@ts-ignore
                .map(c => `${c.key}=${c.value}`)
                .join(';')
//@ts-ignore
            proxyReqOpts.headers['cookie'] = cookies;
        }

        return proxyReqOpts;
    },
}));

//@ts-ignore
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).send('Server error');
});

app.listen(port, () => {
    console.log('Server started');
});


// app.get('/', (req: Request, res: Response) => {
//     let helloItIncubator = 'Hello it-incubator!!!';
//     res.send(helloItIncubator)
// })
//
// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`)
// })
// yarn nodemon --inspect dist/index.js
//kill -9 $(lsof -tis:3000)