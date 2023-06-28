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
  for (let category of categories) {
    for (let index = 1; index <= category.categoryPages; index++) {
      const url =
        "https://coles.com.au" + category.categoryLink + "?page=" + index;
      console.log("Getting data from " + url);

      const pageProducts = await getProductsByURL.getProductsByURL(url);
      // Use scrapeDate or date of mongo insert?

      const scrapeDate = new Date().toISOString();
      await client.connect();
      for (product of pageProducts) {
        const existingDocument = await collection.findOne({
          productCode: product.productCode,
        });

        if (existingDocument) {
          console.log("Found existing item: " + product.productCode+ " - updating.");
          collection.updateOne(
            { productCode: product.productCode },
            { $push: {
              priceHistory: { 
                  productPrice: product.productPrice,
                  scrapeDate: scrapeDate,
                }
              }
            }
          );
        } else {
          console.log("Product not found: " + product.productCode + " - inserting");
          collection.insertOne({
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
              scrapeDate: scrapeDate
            }]
          })
        }
      }
      // Delay incase of rate limiting.
      // await delay(150);
    }
    await client.close();
  }
}

getAllProduts();
