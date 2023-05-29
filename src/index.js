"use strict";
const express = require('express');
const app = express();
const port = 3001;

app.get('/', (req, res) => {
    let helloMessage = "hello message";
    console.log(helloMessage);
    res.send('Hello incubator112!');
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
