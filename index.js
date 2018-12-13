const express = require('express');
const bodyParser = require('body-parser');
const scrapeData = require('./utils.js');

const app = express();
const router = require('express').Router();
const PORT = process.env.PORT || 5000;

router.get('/', function (req, res) {
    scrapeData('lasanha');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', router);

app.listen(PORT);

console.log(`Listening on port ${PORT}`);