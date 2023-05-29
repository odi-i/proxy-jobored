"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 3001;
app.get('/', (req, res) => {
    let str = 'asd';
    console.log(str);
    res.send('Hello 1woqwrd!');
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
// yarn nodemon --inspect dist/index.js
//kill -9 $(lsof -tis:3000)
