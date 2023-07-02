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

async function getProductByTitle(productTitle) {
  try {
    await client.connect();
    const regexPattern = new RegExp(`.*${productTitle}.*`, 'i')
    const foundCursor = await collection.find({
      productTitle: {$regex: regexPattern },
    });
    const foundProducts = await foundCursor.toArray()
    await client.close();

    if (!foundProducts) {
      throw new Error("Error getting title");
    }
    return foundProducts
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  getProductByID,
  getProductByTitle,
};
