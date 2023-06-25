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
        categoryProducts.push(pageProducts);
      });
    });
    console.log(categoryProducts.length);
    console.dir(categoryProducts, { maxArrayLength: null });
    // This logs the whole array, otherwise console output is trimmed.
    // Note that productID isn't unique now. There's a productID = 2 on every page, for ex.
  });

  // Waiting for all axios requests to complete. The requests array is in order of pages.
  // Previously was out of order due to async GET requests.
  // This leaves us with n number of arrays for n number of pages in the category.
  // Need to concat all objects from all arrays into a single categoryProductObject?
});
