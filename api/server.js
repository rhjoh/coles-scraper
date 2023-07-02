const express = require("express");
const app = express();
const getProduct = require("./models/getProduct");
const cors = require('cors')

/* 
Routes needed: 

    - get by ID. 
    - get by productTitle  
    - get by special status? 
    - get by category? 

*/

app.use(cors())
app.get("/api/product/id=:id", async (req, res) => {
  let testID = "03199541";
  let productParam = req.params.id;
  product = await getProduct.getProductByID(testID);
  console.log(product);
  res.send(product);
  res.end();
});

app.get("/api/product/title=:title", async (req, res) => {
  let titleParam = req.params.title;
  products = await getProduct.getProductByTitle(titleParam);
  res.send(products);
  console.log(products)
});

app.listen(8000, () => {
  console.log("Listening on 8000");
});
