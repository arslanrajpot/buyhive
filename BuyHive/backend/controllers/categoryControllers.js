const db = require("../startup/db")

function transformToHierarchy(data, parentId = null) {
  const hierarchy = [];
  data.forEach(item => {
    if (item.parent_category_id === parentId) {
      const children = transformToHierarchy(data, item.category_id);
      if (children.length > 0) {
        item.children = children;
      }
      hierarchy.push(item);
    }
  });
  return hierarchy;
}

const getCategories = async (req, res) => {
  try {
    const categoriesResult = await db.query("SELECT category_name, category_id, parent_category_id FROM category;");
    const categories = transformToHierarchy(categoriesResult);
    res.send(categories)
  } catch(e) {
    res.status(500).send("Error")
  }
}

module.exports = {
  getCategories
};
