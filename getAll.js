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

      try {
      const pageProducts = await getProductsByURL.getProductsByURL(url);

      const scrapeDate = new Date();
      for (product of pageProducts) {
        const existingDocument = await collection.findOne({
          productCode: product.productCode,
        });

        // Example: https://productimages.coles.com.au/productimages/4/4770699.jpg?w=200
        let imageURL;
        if(product.productCode){
        const productCodeFirst = (product.productCode).split('')[0]
        imageURL = `https://productimages.coles.com.au/productimages/${productCodeFirst}/${product.productCode}.jpg?w=200`
        }
        
        // Check time since last push to priceHistory
        let priceHistoryLatest;
        let lastTime;
        if(existingDocument){
          priceHistoryLatest = Object.keys(existingDocument.priceHistory).length - 1
          lastTime = existingDocument.priceHistory[priceHistoryLatest].scrapeDate
        }
        const timeDiff = 6 * 60 * 60 * 1000 // 6 hours in millis 
        const needsUpdating = (scrapeDate - lastTime) > timeDiff
        // WARN: If you run the scraper before [timeDiff] has elapsed since last scrap it will insert duplicates via the else statement. 
        if (existingDocument && needsUpdating) {
          // Need to handle case where productCode is null

            console.log("Found " + product.productCode + " which needs updating. ")

            if(category.categoryTitle == "Specials"){ 
              await collection.updateOne(
              { productCode: product.productCode },
              { 
                $set: {
                productTitle: product.productTitle,
                productAvail: product.productAvail,
                productLink: product.productLink,
                productCode: product.productCode,
                productPrice: product.productPrice,
                productImage: imageURL,
                },
                $push: {
                priceHistory: { 
                    productPrice: product.productPrice,
                    scrapeDate: scrapeDate,
                    isSpecial: true
                  }
                }
              }
            );
              } else {
              // If exists and not special: 
                await collection.updateOne(
              { productCode: product.productCode },
              { 
                $set: {
                productCategory: category.categoryTitle,
                productTitle: product.productTitle,
                productAvail: product.productAvail,
                productLink: product.productLink,
                productCode: product.productCode,
                productPrice: product.productPrice,
                productImage: imageURL,
                },
                $push: {
                priceHistory: { 
                    productPrice: product.productPrice,
                    scrapeDate: scrapeDate,
                    isSpecial: false
                  }
                }
              }
            );
          }
        } else if (!existingDocument){
          console.log("Product not found: " + product.productCode + " - inserting");
          if(category.categoryTitle == "Specials"){
          await collection.insertOne({
            productTitle: product.productTitle,
            productAvail: product.productAvail,
            productLink: product.productLink,
            productCode: product.productCode,
            productPrice: product.productPrice,
            lastScrapeDateTime: scrapeDate, 
            productImage: imageURL,
            priceHistory: [{
              productPrice: product.productPrice,
              scrapeDate: scrapeDate,
              isSpecial: true
            }]
          })
         } else {
          await collection.insertOne({
            productCategory: category.categoryTitle,
            productTitle: product.productTitle,
            productAvail: product.productAvail,
            productLink: product.productLink,
            productCode: product.productCode,
            productPrice: product.productPrice,
            lastScrapeDateTime: scrapeDate, 
            productImage: imageURL,
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
      console.log(error)
    }
  } 
}
  await client.close();
}

getAllProduts();
