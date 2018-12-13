const request = require('request');
const cheerio = require('cheerio');

const scrapeData = function (query) {    
    //const url = `https://www.tudogostoso.com.br/busca?q=${query}`;
    const url = `https://www.tudoreceitas.com/pesquisa?q=${query}`;

    const options = {
        headers: { 
            'User-Agent': 'Mozilla/5.0'
        }
    }

    request(url, options, (error, res, html) => {
        if (error || res.statusCode !== 200) {
            return console.log(`${res.statusCode}: ${error}`);
        }

        const cherrio = cheerio.load(html);

        cherrio('div.resultado.link').each(function (i, element) {
            console.log(element);
        });
    });
}

module.exports = scrapeData;