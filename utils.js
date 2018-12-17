const request = require("request");
const cheerio = require("cheerio");

const options = {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0"
  }
};

const searchRecipe = (query, callback) => {
  const url = `https://www.tudoreceitas.com/pesquisa/q/${query}/type/1`;

  request(url, options, (error, res, html) => {
    if (error || res.statusCode !== 200) {
      return callback({
        error: {
          code: res.statusCode,
          message: error
        }
      });      
    }

    const scraper = cheerio.load(html);
    const searchResults = [];

    scraper("div.resultado.link").each((index, element) => {
      const result = scraper(element).find("a.titulo.titulo--resultado");

      const title = result.text();
      const link = result.attr("href");

      searchResults.push({
        title: title,
        link: link
      });
    });

    scrapeData(query, searchResults[0].link, callback);
  });
};

const scrapeData = (query, url, callback) => {
  request(url, options, (error, res, html) => {
    if (error || res.statusCode !== 200) {
      return `${res.statusCode}: ${error}`;
    }

    const scraper = cheerio.load(html);

    let result = {
      title: "",
      confidence: 0.0,
      link: url,
      properties: {},
      ingredients: [],
      instructions: []
    };

    result.title = scraper("h1.titulo.titulo--articulo").text();
    result.confidence = calculateConfidence(query, result.title);

    const properties = scraper("div.properties");
    result.properties.portion = properties
      .find("span.property.comensales")
      .text();
    result.properties.duration = properties
      .find("span.property.duracion")
      .text();
    result.properties.recomendation = properties
      .find("span.property.para")
      .text();
    result.properties.difficulty = properties
      .find("span.property.dificultad")
      .text();

    scraper("div.ingredientes ul li.ingrediente").each((i, element) => {
      const ingredient = scraper(element).find("label");

      const ingredientText = ingredient.text();

      if (ingredientText && ingredientText !== ",") {
        result.ingredients.push(ingredientText);
      }
    });
    
    scraper("div .apartado").each((i, element) => {
      const instruction = scraper(element)
        .find("div.orden")
        .next();

      if (instruction.text().length > 0){
        result.instructions.push(instruction.text());
      }      
      
    });

    callback(cleanResult(result));
  });
};

const cleanResult = result => {
  result.instructions.pop();
  result.instructions.push("Pronto!");  

  for (let i = 0; i < result.ingredients.length; i++) {
    let str = result.ingredients[i].replace(/\n/g, "");

    if (str.split("")[str.length - 1] === " ") {
      str = str.substring(0, str.length - 1);
    }

    result.ingredients[i] = str;
  }

  return result;
};

const encodeQuery = query => {
  return query
    .toLowerCase()
    .split(" ")
    .join("+");
};

const calculateConfidence = (query, title) => {
  const queryWords = query.split("+");
  const titleWords = title.toLowerCase().split(" ");
  let successRate = 0;

  for (index in queryWords) {
    if (titleWords.indexOf(queryWords[index]) !== -1) {
      successRate = successRate + 1;      
    }
  } 

  return (successRate/queryWords.length);
}

module.exports = {
  searchRecipe: searchRecipe,
  encodeQuery: encodeQuery
};
