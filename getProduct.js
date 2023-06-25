// Get product details: product title and current price.

const axios = require("axios");
const cheerio = require("cheerio");

const url = "https://www.coles.com.au/on-special?page=163";

let data;
axios.get(url).then((res) => {
  data = res.data;
  let productObject = []
  const $ = cheerio.load(data);

  $(
    'section[data-testid="product-tile"].coles-targeting-ProductTileProductTileWrapper'
  ).each((index, element) => {

    let productTitle = $(element)[0].children[0].children[0].children[1].children[0].children[0].children[0].data  
    let productLink = $(element)[0].children[0].children[0].children[1].children[0].attribs['href']
    // Get product code from href
    const regex = /.*-(.*)$/;
    let productCode = productLink.match(regex)
    let productAvail;
    let productPrice;
    /* 
      Check for product__unavailable class on ProductTile.
      TODO: Some products show as unavailable but have a price listed. Need to account for this. 
    */
    if($(element)[0].children[1].children[1].children[0].children[0].attribs['class'].includes("product__unavailable")){
      console.log("Product unavailable")
      productAvail = 0;
      productPrice = null
    }
    else{
      productAvail = 1;
      productPrice = $(element)[0].children[1].children[0].children[0].children[0].children[0].children[0].data 
    }

    productObject.push({
      productID: Object.keys(productObject).length + 1,
      productTitle: productTitle,
      productAvail: productAvail,
      productPrice: productPrice,
      productLink: productLink,
      productCode: productCode[1]
    })
  });
  console.log(productObject)
});

/*
Get the product name of the first product tile: 
console.log($('section[data-testid="product-tile"].coles-targeting-ProductTileProductTileWrapper')[0].children[0].children[0].children[1].children[0].children[0].children[0].data)

      productTitle: $(element)[0].children[0].children[0].children[1].children[0].children[0].children[0].data,
      productPrice: $(element)[0].children[1].children[0].children[0].children[0].children[0].attribs["aria-label"] 


Price: 
console.log($('section[data-testid="product-tile"].coles-targeting-ProductTileProductTileWrapper')[0].children[1].children[0].children[0].children[0].children[0].attribs['aria-label'])
*/
