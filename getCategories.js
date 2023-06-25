// Get list of categories and links to category page.
const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://www.coles.com.au/browse";

let categoryObject = [];
async function getCategoryList() {
  try {
    const res = await axios.get(url);
    const data = res.data;
    const $ = cheerio.load(data);

    $('a[data-testid="category-card"]').each((index, element) => {
      let categoryTitle = $(element)[0].attribs["aria-label"];
      let categoryLink = $(element)[0].attribs["href"];
      categoryObject.push({
        categoryID: Object.keys(categoryObject).length + 1,
        categoryTitle: categoryTitle,
        categoryLink: categoryLink,
      });
      // Removing Liquor and Tobacco categories. Liquor has 1 page, tobacco has an age requirement modal.
      categoryObject = categoryObject.filter(
        (list) =>
          list.categoryTitle !== "Liquor" && list.categoryTitle !== "Tobacco"
      );
    });

    return categoryObject;
  } catch (error) {
    console.error("Error fetching category list:", error);
    throw error;
  }
}

async function getCategoryPages() {
  try {
    const categories = await getCategoryList();
    const promises = categories.map((category, index) => {
      return axios
        .get("https://coles.com.au" + category.categoryLink)
        .then((res) => {
          const pageData = res.data;
          const $$ = cheerio.load(pageData);
          let navBar = $$("ul.coles-targeting-PaginationPaginationUl");
          let numOfElements = navBar[0].children.length;
          let lastPageNumber = Number(
            navBar[0].children[numOfElements - 2].children[0].children[0].data
          );
          categories[index].categoryPages = lastPageNumber;
        });
    });
    await Promise.all(promises);
    return categories;
  } catch {
    console.log("Error getting categories");
  }
}

module.exports = {
  getCategoryPages,
};
