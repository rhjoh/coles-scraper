const getCategoryPages = require("./getCategories");
const getProductsByURL = require("./getProduct");

getCategoryPages.getCategoryPages().then((categories) => {
  console.log("Getting products for " + categories[2].categoryLink);
  const requests = [];
  for (let index = 1; index <= categories[2].categoryPages; index++) {
    const url =
      "https://coles.com.au" + categories[2].categoryLink + "?page=" + index;
    requests.push(getProductsByURL.getProductsByURL(url));
  }

  Promise.all(requests).then((pageRequests) => {
    let categoryProducts = [];
    pageRequests.forEach((page) => {
      console.log(page.length);

      page.forEach((pageProducts) => {
        // Add ID for each product in a category. Add date time. 
        pageProducts.prodctCatID = Object.keys(categoryProducts).length + 1
        pageProducts.productScrapeDate = new Date().toISOString()
        categoryProducts.push(pageProducts);
      });
    });
    console.log(categoryProducts);
  });
});
