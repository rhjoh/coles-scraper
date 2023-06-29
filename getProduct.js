const axios = require('axios');
const cheerio = require('cheerio');
const { MongoExpiredSessionError } = require('mongodb');

async function getProductsByURL(url_param){
  let retryCount = 0;
  let maxRetries = 3;

  while(retryCount <= maxRetries){
    try {
  const res = await axios.get(url_param);
  const data = res.data;
  const $ = cheerio.load(data)
  let productObject = []

  $(
    'section[data-testid="product-tile"].coles-targeting-ProductTileProductTileWrapper'
  ).each((index, element) => {

    let productTitle = $(element)[0].children[0].children[0].children[1].children[0].children[0].children[0].data  
    let productLink = $(element)[0].children[0].children[0].children[1].children[0].attribs['href']

    // Get product code from href
    const regex = /.*-(.*)$/;
    let productCode;
    if(productLink && productLink.match(regex)){
      productCode = productLink.match(regex)[1]
    } else {
      productCode = null;
    }
    let productAvail;
    let productPrice;
    if($(element)[0].children[1].children[1].children[0].children[0].attribs['class'].includes("product__unavailable")){
      productAvail = 0;
      productPrice = null
    }
    else{
      productAvail = 1;
      productPrice = $(element)[0].children[1].children[0].children[0].children[0].children[0].children[0].data 
      const priceRegex = /\$(.+)/
      productPrice = productPrice.match(priceRegex)[1]
    }

    productObject.push({
      productTitle: productTitle,
      productAvail: productAvail,
      productPrice: productPrice,
      productLink: productLink,
      productCode: productCode
    })
  });
return productObject
  } catch (error) {
    console.log("Error - trying again")
    console.log(error.response.status)
    console.log(error.response.statusText)
    console.log(error.response.config.url)
    retryCount++
  }
} 
}

module.exports = {
  getProductsByURL
}