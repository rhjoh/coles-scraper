const { MongoClient } = require("mongodb");

const mongoURI = process.env.MONGO_URI;
const client = new MongoClient(mongoURI);
const collection = client.db("Cluster0").collection("productMaster.product");

async function getProductByID(productCode) {
  try {
    await client.connect();
    const foundProduct = await collection.findOne({
      productCode: productCode,
    });
    await client.close();

    if (!foundProduct) {
      throw new Error("Item not found.");
    }
    return foundProduct;
  } catch (error) {
    throw new Error("Mongo error: " + error.message);
  }
}

async function getProductsByTitle(productTitle) {
    // Return an array of products with only the latest priceHistory object. 
  try {
    await client.connect();
    const regexPattern = new RegExp(`.*${productTitle}.*`, "i");

    const foundDocuments = await collection
      .find({
        productTitle: { $regex: regexPattern },
      })
      .toArray();
    
      if(!foundDocuments){
        throw new Error("Mongo error: " + error.message)
      }

    // Aggregate query basically selects the most recent scrapeDate. 
    const foundProducts = await collection.aggregate([
      { $match: { _id: { $in: foundDocuments.map((doc) => doc._id) } } },
      { $unwind: "$priceHistory" },
      { $sort: { "priceHistory.scrapeDate": -1 } },
      {
        $group: {
          _id: "$_id",
          productCategory: { $first: "$productCategory" },
          productTitle: { $first: "$productTitle" },
          productAvail: { $first: "$productAvail" },
          productLink: { $first: "$productLink" },
          productCode: { $first: "$productCode" },
          productPrice: { $first: "$productPrice" },
          lastScrapeDateTime: { $first: "$lastScrapeDateTime" },
          productImage: { $first: "$productImage" },
          priceHistory: { $first: "$priceHistory" },
        },
      },
    ]).toArray();
    await client.close()

    console.log(typeof(foundProducts))
    return foundProducts;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getProductByID,
  getProductsByTitle,
};
