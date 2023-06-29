const axios = require('axios');
const cheerio = require('cheerio');
const { MongoExpiredSessionError } = require('mongodb');

async function getProductsByURL(url_param){
  const res = await axios.get(url_param);
  const data = res.data;
  const $ = cheerio.load(data)
  let productObject = []

  $(
    'section[data-testid="product-tile"].coles-targeting-ProductTileProductTileWrapper'
  ).each((index, element) => {

    let productTitle = $(element)[0].children[0].children[0].children[1].children[0].children[0].children[0].data  
    let productLink = $(element)[0].children[0].children[0].children[1].children[0].attribs['href']

    if(productTitle == "Promoted"){
      console.log("Found promoted")
    }

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
    /* 
      Check for product__unavailable class on ProductTile.
      TODO: Some products show as unavailable but have a price listed. Need to account for this. 
    */
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
}

module.exports = {
  getProductsByURL
}