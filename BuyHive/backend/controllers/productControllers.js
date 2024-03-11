const db = require("../startup/db")

const getProducts = async (req, res) => {
  try {
    console.log(req.query)
    var category_name = req.query.category_name
    var keyword = req.query.keyword
    if (category_name==='All Categories') {
      category_name = ""
    }

    const queryParams = [];
    const queries = [];

    let query1 = `SELECT DISTINCT p.* FROM products p`;
    let query2 = `SELECT MIN(p.price) FROM products p`;
    let query3 = `SELECT MAX(p.price) FROM products p`;
    let query4 = `SELECT DISTINCT p.manufacturer_location FROM products p`;
    let query5 = `SELECT DISTINCT pc.certificate_name FROM product_certificate pc `;
    let query6 = `SELECT DISTINCT sc.certificate_name FROM supplier_certificate sc`;
    let query7 = ``;

    if (keyword) {
      query1 += ` WHERE p.product_name LIKE ${`'%${keyword}%'`} `
    }

    if (category_name) {
      // Find the category_id based on category_name
      const categoryQuery = 'SELECT category_id FROM category WHERE category_name = $1';
      queryParams.push(category_name);
      queries.push(categoryQuery);

      query1 += `
        ${ query1.includes("WHERE") ? " AND " : " WHERE " } p.category_id IN (
          SELECT category_id FROM category
          WHERE category_id = (
            SELECT category_id FROM category WHERE category_name = $1
          ) OR category_id IN (
            SELECT category_id FROM category
            WHERE parent_category_id = (
              SELECT category_id FROM category WHERE category_name = $1
            )
          )
        )`;

      query2 += `
        WHERE p.category_id IN (
          SELECT category_id FROM category
          WHERE category_id = (
            SELECT category_id FROM category WHERE category_name = $1
          ) OR category_id IN (
            SELECT category_id FROM category
            WHERE parent_category_id = (
              SELECT category_id FROM category WHERE category_name = $1
            )
          )
        )`;

      query3 += `
        WHERE p.category_id IN (
          SELECT category_id FROM category
          WHERE category_id = (
            SELECT category_id FROM category WHERE category_name = $1
          ) OR category_id IN (
            SELECT category_id FROM category
            WHERE parent_category_id = (
              SELECT category_id FROM category WHERE category_name = $1
            )
          )
        )`;

      query4 += `
        WHERE p.category_id IN (
          SELECT category_id FROM category
          WHERE category_id = (
            SELECT category_id FROM category WHERE category_name = $1
          ) OR category_id IN (
            SELECT category_id FROM category
            WHERE parent_category_id = (
              SELECT category_id FROM category WHERE category_name = $1
            )
          )
        )`;

      // Query to retrieve product certificates based on category_name
      query5 += ` 
      JOIN product_certificate_bridge pcb ON pc.certificate_id = pcb.certificate_id
      JOIN products p ON pcb.product_id = p.product_id
      WHERE p.category_id IN (
        SELECT category_id FROM category WHERE category_id = (
          SELECT category_id FROM category WHERE category_name = $1
        ) OR parent_category_id IN (
          SELECT category_id FROM category WHERE category_name = $1
        )
      );
    `;

      // Query to retrieve supplier certificates based on category_name
       query6 += `
       JOIN supplier_certificate_bridge scb ON sc.certificate_id = scb.certificate_id
       WHERE scb.supplier_id IN (
         SELECT supplier_id FROM products WHERE category_id IN (
           SELECT category_id FROM category WHERE category_id = (
             SELECT category_id FROM category WHERE category_name = $1
           ) OR parent_category_id IN (
             SELECT category_id FROM category WHERE category_name = $1
           )
         )
       );
     `;


     query7 += `SELECT category_name from category where parent_category_id in (
      SELECT category_id from category where category_name = $1
     )`

    }

    console.log(query1)
    const products = await db.query(query1, queryParams);
    const minPrice = await db.query(query2, queryParams);
    const maxPrice = await db.query(query3, queryParams);
    const location = await db.query(query4, queryParams);
    const productCertificate = await db.query(query5, queryParams);
    const supplierCertificate = await db.query(query6, queryParams);
    const subCategories = category_name ? await db.query(query7, queryParams) : []

    const productWithFirstRender = {
      products,
      subCategories,
      minPrice,
      maxPrice,
      location,
      productCertificate,
      supplierCertificate
    };

    res.send(productWithFirstRender);
  } catch (e) {
    console.error('Error:', e);
    res.status(500).send('Error');
  }
}

const getFilteredProducts = async (req, res) => {
  let {
    minOrderQuantity,
    manufacturerLocation,
    priceRange,
    availableInUSA,
    productCertificates,
    supplierCertificates,
    category,
    keyword,
    sortby,
  } = req.query;
  console.log(req.query)
  console.log(sortby)
  // manufacturerLocation = "('"+manufacturerLocation.join("','")+"')"
  // console.log(manufacturerLocation)

  const queryParams = [];

  let query = 'SELECT DISTINCT p.* FROM products p';

  if (category==='All Categories') {
    category = ""
  }
  if(sortby==="default"){
    sortby = ""
  }

  // if (category) {
  //   if (query.includes('JOIN')) {
  //     query += ` AND category c ON (p.category_id = c.category_id OR p.category_id = c.parent_category_id) AND c.category_name = '${category}'`;
  //   } else {
  //     query += ` JOIN category c ON (p.category_id = c.category_id OR p.category_id = c.parent_category_id) AND c.category_name = '${category}'`;
  //   }
  // }




  // Join with product_certificate_bridge and supplier_certificate_bridge tables
  if (productCertificates) {
    query += ' JOIN product_certificate_bridge pcb ON p.product_id = pcb.product_id';
  }

  if (supplierCertificates) {
    query += ' JOIN supplier_certificate_bridge scb ON p.supplier_id = scb.supplier_id';
    query += ' JOIN supplier_certificate sc ON scb.certificate_id = sc.certificate_id';
  }

  // Join with the category table


  // Handle Keyword filter
  if (keyword) {
    if (query.includes('WHERE')) {
      query += ` AND p.product_name LIKE ${`'%${keyword}%'`}`;
    } else {
      query += ` WHERE p.product_name LIKE ${`'%${keyword}%'`}`;
    }
  }


  if (category) {
    if (query.includes('WHERE')){
  query += ` AND  p.category_id IN (
    SELECT category_id FROM category
    WHERE category_id = (
      SELECT category_id FROM category WHERE category_name = '${category}'
    ) OR category_id IN (
      SELECT category_id FROM category
      WHERE parent_category_id = (
        SELECT category_id FROM category WHERE category_name = '${category}'
      )
    )
  )`
  }else{
    query += ` WHERE p.category_id IN (
      SELECT category_id FROM category
      WHERE category_id = (
        SELECT category_id FROM category WHERE category_name = '${category}'
      ) OR category_id IN (
        SELECT category_id FROM category
        WHERE parent_category_id = (
          SELECT category_id FROM category WHERE category_name = '${category}'
        )
      )
    )`


  }
}

  // Handle Min Order Quantity filter
  if (minOrderQuantity) {
    // Parse minOrderQuantity as an integer
    const minQuantity = parseInt(minOrderQuantity);
    if (!isNaN(minQuantity)) {
      if (query.includes('WHERE')) {
        query += ` AND p.quantity >= $${queryParams.push(minQuantity)}`;
      } else {
        query += ` WHERE p.quantity >= $${queryParams.push(minQuantity)}`;
      }
    }
  }

  // Handle Product Certification filter
  if (productCertificates) {
    let tmp = "('"+productCertificates.join("','")+"')"
    if (query.includes('WHERE')) {
      query += ` AND pcb.certificate_id IN (SELECT certificate_id FROM product_certificate WHERE certificate_name IN ${tmp})`;
    } else {
      query += ` WHERE pcb.certificate_id IN (SELECT certificate_id FROM product_certificate WHERE certificate_name IN ${tmp})`;
    }
  }



  if (supplierCertificates) {
    let tmp = "('"+supplierCertificates.join("','")+"')"
    if (query.includes('WHERE')) {
      query += ` AND scb.certificate_id IN (SELECT certificate_id FROM supplier_certificate WHERE certificate_name IN ${tmp})`;
    } else {
      query += ` WHERE scb.certificate_id IN (SELECT certificate_id FROM supplier_certificate WHERE certificate_name IN ${tmp})`;
    }
  }

  // Handle Manufacturer Location filter
  if (manufacturerLocation) {
    let loc = "('"+manufacturerLocation.join("','")+"')"
    if (query.includes('WHERE')) {
      // query += ` AND p.manufacturer_location IN $${queryParams.push(manufacturerLocation)}`;
      query += ` AND p.manufacturer_location IN ${loc}`;
    } else {
      // query += ` WHERE p.manufacturer_location IN $${queryParams.push(manufacturerLocation)}`;
      query += ` WHERE p.manufacturer_location IN ${loc}`;
    }
  }

  // Handle Price Range filter
  if (priceRange) {
    const [minPrice, maxPrice] = priceRange.split('-');
    if (minPrice && maxPrice) {
      if (query.includes('WHERE')) {
        query += ` AND p.price BETWEEN $${queryParams.push(minPrice)} AND $${queryParams.push(maxPrice)}`;
      } else {
        query += ` WHERE p.price BETWEEN $${queryParams.push(minPrice)} AND $${queryParams.push(maxPrice)}`;
      }
    }
  }

  // Handle Available in USA filter
  if (availableInUSA === "true") {
    if (query.includes('WHERE')) {
      query += ` AND p.in_usa = $${queryParams.push(availableInUSA)}`;
    } else {
      query += ` WHERE p.in_usa = $${queryParams.push(availableInUSA)}`;
    }
  }

  if (sortby){
    if(sortby == "latest"){
      query += ` ORDER BY created_date`
    }else if(sortby =="price-desc"){
      query += ` ORDER BY price DESC`  
    }else if(sortby =="price-asc"){
      query += ` ORDER BY price `
    }else{
      query += ` ORDER BY quantity `
    }
  }


  // Execute the SQL query and return the filtered data
  console.log(query)
  db.query(query, queryParams)
    .then((filteredData) => {
      res.json(filteredData);
      // console.log(filteredData)

    })
    .catch((error) => {
      console.error('Error executing filter query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
}

module.exports = {
  getProducts,
  getFilteredProducts,
};

