const express = require("express");
const app = express();
const getProduct = require("./models/getProduct");
const cors = require('cors')

/* 
Routes needed: 
    - get by special status? 
    - get by category? 
*/

app.use(cors())
app.get("/api/product/id=:id", async (req, res) => {
  const productID = req.params.id
  product = await getProduct.getProductByID(productID);
  console.log(product);
  res.send(product);
});

app.get("/api/product/title=:title", async (req, res) => {
  let titleParam = req.params.title;
  products = await getProduct.getProductsByTitle(titleParam);
  res.send(products);
  console.log(products)
});

app.listen(8000, () => {
  console.log("Listening on 8000");
});
