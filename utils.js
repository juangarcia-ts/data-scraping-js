const request = require("request");
const cheerio = require("cheerio");

const options = {
  headers: {
    "User-Agent": "Mozilla/5.0"
  }
};

const getResults = (query, callback) => {
  const url = `https://www.tudoreceitas.com/pesquisa/q/${query}/type/1`;

  request(url, options, (error, res, html) => {
    if (error || res.statusCode !== 200) {
      return `${res.statusCode}: ${error}`;
    }

    const chr = cheerio.load(html);

    const results = [];

    chr("div.resultado.link").each((i, element) => {
      const result = chr(element).find("a.titulo.titulo--resultado");

      const title = result.text();
      const link = result.attr("href");

      results.push({
        title: title,
        link: link
      });
    });

    scrapeData(results[0].link, callback);
  });
};

const scrapeData = (url, callback) => {
  request(url, options, (error, res, html) => {
    if (error || res.statusCode !== 200) {
      return `${res.statusCode}: ${error}`;
    }

    let result = {
      title: "",
      link: url,
      properties: {},
      ingredients: [],
      instructions: []
    };

    const chr = cheerio.load(html);

    result.title = chr("h1.titulo.titulo--articulo").text();

    const properties = chr("div.properties");
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

    chr("div.ingredientes ul li.ingrediente").each((i, element) => {
      const ingredient = chr(element).find("label");

      const ingredientText = ingredient.text();

      if (ingredientText && ingredientText !== ",") {
        result.ingredients.push(ingredientText);
      }
    });

    chr("div .apartado").each((i, element) => {
      const instruction = chr(element)
        .find("div.orden")
        .next();

      result.instructions.push(instruction.text());
    });

    callback(cleanResult(result));
  });
};

const encodeQuery = query => {
  return query
    .toLowerCase()
    .split(" ")
    .join("+");
};

const cleanResult = result => {
  result.instructions = result.instructions.slice(
    0,
    result.instructions.length - 3
  );

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

module.exports = {
  getResults: getResults,
  encodeQuery: encodeQuery
};
