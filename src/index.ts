import express from 'express'
import proxy from 'express-http-proxy';
import * as dotenv from 'dotenv'
import requestIp from 'request-ip';
import cors from 'cors';
import {LRUCache} from "lru-cache";

dotenv.config()

const app = express();
const port = 3000;

const cookiePerIP = new LRUCache({
    max: 1000,
    ttl: 1000 * 60 * 3,
    updateAgeOnGet: false,
    updateAgeOnHas: false,
});
const allowList = ['http://localhost:5173','https://papaya-entremet-3046cd.netlify.app']

const corsOptions = {
    origin:(origin:any, callback:any)=> {
        if (allowList.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};


app.use(cors(corsOptions));

app.use(requestIp.mw());

//@ts-ignore
app.use('/', proxy('https://api.superjob.ru', {
    https: true,
    userResHeaderDecorator(headers, userReq,) {
        const key = userReq.clientIp;

        if (headers['set-cookie']) {
            const newCookies = headers['set-cookie'].map(c => {
                const [key, value] = c.split(';')[0].split('=');
                return {key, value};
            });

            const previousCookies = cookiePerIP.get(key!) || [];
//@ts-ignore
            const currentCookies = previousCookies.concat(newCookies);

            cookiePerIP.set(key!, currentCookies);
        }

        return headers;
    },
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
        const key = srcReq.clientIp;

        if (cookiePerIP.has(key!)) {
//@ts-ignore
            const cookies = cookiePerIP
                .get(key!)
                //@ts-ignore
                .map(c => `${c.key}=${c.value}`)
                .join(';')

            proxyReqOpts.headers!['cookie'] = cookies;
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
