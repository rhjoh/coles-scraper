const { MongoClient } = require("mongodb");
const getCategoryPages = require("./getCategories");
const getProductsByURL = require("./getProduct");

const mongoURI = process.env.MONGO_URI;
const client = new MongoClient(mongoURI);
const collection = client.db("Cluster0").collection("productMaster.product");

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getAllProduts() {
  const categories = await getCategoryPages.getCategoryPages();
  await client.connect();
  for (let category of categories) {
    for (let index = 1; index <= category.categoryPages; index++) {
      const url =
        "https://coles.com.au" + category.categoryLink + "?page=" + index;
      console.log("Getting data from " + url);

      let retryCount = 0;
      let maxRetries = 3;
      while(retryCount <= maxRetries){
        try {
      const pageProducts = await getProductsByURL.getProductsByURL(url);
      // Need a try ... catch here to handle 500's. 
      // Could use a while(n retries) loop which would start above getProductsByURL(?)

      const scrapeDate = new Date().toISOString();
      for (product of pageProducts) {
        const existingDocument = await collection.findOne({
          productCode: product.productCode,
        });

        if (existingDocument) {
          console.log("Found existing item: " + product.productCode+ " - updating.");
          if(category.categoryTitle == "Specials"){
          await collection.updateOne(
            { productCode: product.productCode },
            { $push: {
              priceHistory: { 
                  productPrice: product.productPrice,
                  scrapeDate: scrapeDate,
                  isSpecial: true
                }
              }
            }
          );
          } else {
          await collection.updateOne(
            { productCode: product.productCode },
            { $push: {
              priceHistory: { 
                  productPrice: product.productPrice,
                  scrapeDate: scrapeDate,
                  isSpecial: false
                }
              }
            }
          );
          }
        } else {
          console.log("Product not found: " + product.productCode + " - inserting");
          if(category.categoryTitle == "Specials"){
          await collection.insertOne({
            productCategory: category.categoryTitle,
            categoryPage: index,
            productTitle: product.productTitle,
            productAvail: product.productAvail,
            productLink: product.productLink,
            productCode: product.productCode,
            productPrice: product.productPrice,
            lastScrapeDateTime: scrapeDate, 
            priceHistory: [{
              productPrice: product.productPrice,
              scrapeDate: scrapeDate,
              isSpecial: true
            }]
          })
         } else {
          await collection.insertOne({
            productCategory: category.categoryTitle,
            categoryPage: index,
            productTitle: product.productTitle,
            productAvail: product.productAvail,
            productLink: product.productLink,
            productCode: product.productCode,
            productPrice: product.productPrice,
            lastScrapeDateTime: scrapeDate, 
            priceHistory: [{
              productPrice: product.productPrice,
              scrapeDate: scrapeDate,
              isSpecial: false
            }]
          })
         }
        }
      }
      // Delay incase of rate limiting.
      // await delay(150);
    }
    catch (error){
      console.log("Error - will try again in 2000ms")
      console.log(error.response.status)
      console.log(error.response.statusText)
      console.log(error.response.config.url)
      await delay(2000)
      retryCount++
      
    }
  } 
}
}
  await client.close();
}

getAllProduts();
