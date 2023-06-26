const getCategoryPages = require("./getCategories");
const getProductsByURL = require("./getProduct");

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getAllProduts() {
  const categories = await getCategoryPages.getCategoryPages();

  for (let category of categories) {
    console.log(category.categoryTitle);
    console.log(category.categoryPages);

    let allProdsInCat = [];
    for (let index = 1; index <= category.categoryPages; index++) {
      const url =
        "https://coles.com.au" + category.categoryLink + "?page=" + index;
      console.log("Getting data from " + url);

      const pageProducts = await getProductsByURL.getProductsByURL(url);
      const scrapeDate = new Date().toISOString()
      pageProducts.forEach((product) => {
        allProdsInCat.push({
          productCategory: category.categoryTitle,
          categoryPage: index,
          productTitle: product.productTitle,
          productAvail: product.productAvail,
          productLink: product.productLink,
          productCode: product.productCode,
          scrapeDateTime: scrapeDate
        });
      });

      // Delay incase of rate limiting. 
      // await delay(150);
    }
    console.log(allProdsInCat)
  }
}

getAllProduts();
