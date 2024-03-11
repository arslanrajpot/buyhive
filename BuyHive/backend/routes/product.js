const express = require("express")
const router = express.Router();
const db = require("../startup/db")



router.get('/', async (req, res) => {
  try {
    // var { category_name } = req.body.params;
    // console.log(req.query)
    // if (!category_name) {
      var category_name = req.query.category_name
      if (!category_name) {
        category_name = "Category 2"
      }
    // }

    const queryParams = [];
    const queries = [];

    let query1 = `SELECT DISTINCT p.* FROM products p`;
    let query2 = `SELECT MIN(p.price) FROM products p`;
    let query3 = `SELECT MAX(p.price) FROM products p`;
    let query4 = `SELECT DISTINCT p.manufacturer_location FROM products p`;
    let query5 = `SELECT DISTINCT pc.certificate_name FROM product_certificate pc `;
    let query6 = `SELECT DISTINCT sc.certificate_name FROM supplier_certificate sc`;
    let query7 = ``;

    if (category_name) {
      // Find the category_id based on category_name
      const categoryQuery = 'SELECT category_id FROM category WHERE category_name = $1';
      queryParams.push(category_name);
      queries.push(categoryQuery);

      query1 += `
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
});

router.get('/category', async (req,res) =>
{
    try{
      const categoriesResult = await db.query("SELECT category_name, category_id, parent_category_id FROM category;");
      const categories = transformToHierarchy(categoriesResult);
      res.send(categories)
}
catch(e)
{
    res.status(500).send("Error")
}
}) 

router.get('/filters', async (req, res) => {
  let {
    minOrderQuantity,
    manufacturerLocation,
    priceRange,
    availableInUSA,
    productCertificates,
    supplierCertificates,
    category,
    keyword,
  } = req.query;
  console.log(req.query)
  // manufacturerLocation = "('"+manufacturerLocation.join("','")+"')"
  // console.log(manufacturerLocation)

  const queryParams = [];

  let query = 'SELECT DISTINCT p.* FROM products p';

  // Join with product_certificate_bridge and supplier_certificate_bridge tables
  if (productCertificates) {
    query += ' JOIN product_certificate_bridge pcb ON p.product_id = pcb.product_id';
  }

  if (supplierCertificates) {
    query += ' JOIN supplier_certificate_bridge scb ON p.supplier_id = scb.supplier_id';
    query += ' JOIN supplier_certificate sc ON scb.certificate_id = sc.certificate_id';
  }

  // Join with the category table
  if (category) {
    if (query.includes('JOIN')) {
      query += ` AND c.category_name = $${queryParams.push(category)}`;
    } else {
      query += ` JOIN category c ON p.category_id = c.category_id AND c.category_name = $${queryParams.push(category)}`;
    }
  }

  // Handle Keyword filter
  if (keyword) {
    if (query.includes('WHERE')) {
      query += ` AND (p.product_name ILIKE $${queryParams.push(`%${keyword}%`)}) OR (p.product_description ILIKE $${queryParams.push(`%${keyword}%`)})`;
    } else {
      query += ` WHERE (p.product_name ILIKE $${queryParams.push(`%${keyword}%`)}) OR (p.product_description ILIKE $${queryParams.push(`%${keyword}%`)})`;
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
      query += ` AND certificate_name IN ${tmp}`;
    } else {
      query += ` WHERE certificate_name IN ${tmp}`;
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
});



// router.get('/', async (req, res) => {
//   try {
//    // const { category_name } = req.query;
//    const category_name ="Categ"
//     const queryParams = [];
//     const queries = [];

//     let query1 = `SELECT DISTINCT p.* FROM products p `;
//     let query2 = `SELECT MIN(p.price) FROM products p`;
//     let query3 = `SELECT MAX(p.price) FROM products p`;
//     let query4 = `SELECT DISTINCT p.manufacturer_location FROM products p`;

//     if (category_name) {
//       // Find the category_id based on category_name
//       const categoryQuery = 'SELECT category_id FROM category WHERE category_name = $1';
//       queryParams.push(category_name);
//       queries.push(categoryQuery);

//       // Query to retrieve certificates related to products in the specified category
//       const certificateQuery = `
//         SELECT DISTINCT pc.certificate_name
//         FROM product_certificate pc
//         JOIN product_certificate_bridge pcb ON pc.certificate_id = pcb.certificate_id
//         WHERE pcb.product_id IN (
//           SELECT product_id FROM products WHERE category_id = (
//             SELECT category_id FROM category WHERE category_name = $1
//           )
//         );
//       `;
//       queries.push(certificateQuery);

//       query1 += `
//         WHERE p.category_id IN (
//           SELECT category_id FROM category
//           WHERE category_id = (
//             SELECT category_id FROM category WHERE category_name = $1
//           ) OR category_id IN (
//             SELECT category_id FROM category
//             WHERE parent_category_id = (
//               SELECT category_id FROM category WHERE category_name = $1
//             )
//           )
//         )`;

//       query2 += `
//         WHERE p.category_id IN (
//           SELECT category_id FROM category
//           WHERE category_id = (
//             SELECT category_id FROM category WHERE category_name = $1
//           ) OR category_id IN (
//             SELECT category_id FROM category
//             WHERE parent_category_id = (
//               SELECT category_id FROM category WHERE category_name = $1
//             )
//           )
//         )`;

//       query3 += `
//         WHERE p.category_id IN (
//           SELECT category_id FROM category
//           WHERE category_id = (
//             SELECT category_id FROM category WHERE category_name = $1
//           ) OR category_id IN (
//             SELECT category_id FROM category
//             WHERE parent_category_id = (
//               SELECT category_id FROM category WHERE category_name = $1
//             )
//           )
//         )`;

//       query4 += `
//         WHERE p.category_id IN (
//           SELECT category_id FROM category
//           WHERE category_id = (
//             SELECT category_id FROM category WHERE category_name = $1
//           ) OR category_id IN (
//             SELECT category_id FROM category
//             WHERE parent_category_id = (
//               SELECT category_id FROM category WHERE category_name = $1
//             )
//           )
//         )`;
//     }

//     const products = await db.query(query1, queryParams);
//     const minPrice = await db.query(query2, queryParams);
//     const maxPrice = await db.query(query3, queryParams);
//     const location = await db.query(query4, queryParams);

//     //const productCertificate = await db.query("SELECT certificate_name FROM product_certificate GROUP BY certificate_name;");
//     //const supplierCertificate = await db.query("SELECT certificate_name FROM supplier_certificate GROUP BY certificate_name;");

//     const productWithFirstRender = {
//       products,
//     //  allCategories, // Ensure 'allCategories' is defined in your code
//       minPrice,
//       maxPrice,
//       location,
//       productCertificate,
//       supplierCertificate,
//     };

//     res.send(productWithFirstRender);
//   } catch (e) {
//     console.error('Error:', e);
//     res.status(500).send('Error');
//   }
// });













// router.get('/filters', async (req, res) => {
//   const {
//     minOrderQuantity,
//     manufacturerLocation,
//     priceRange,
//     availableInUSA,
//     productCertificates,
//     supplierCertificates,
//     category,
//     keyword ,
//   } = req.query;

//   const queryParams = [];


//   // function stringToBoolean(str) {
//   //   // Convert the input string to lowercase and check its value
//   //   const lowerStr = str.toLowerCase(str);
    
//   //   // Return true for strings that are 'true', '1', 'yes', or 'on', and false for all other values
//   //   return lowerStr === 'true' || lowerStr === '1' || lowerStr === 'yes' || lowerStr === 'on';
//   // }

//   let query = 'SELECT DISTINCT p.* FROM products p';

//   // Join with product_certificate_bridge and supplier_certificate_bridge tables
//   if (productCertificates) {
//     query += ' JOIN product_certificate_bridge pcb ON p.product_id = pcb.product_id';
//   }

//   if (supplierCertificates) {
//     query += ' JOIN supplier_certificate_bridge scb ON p.supplier_id = scb.supplier_id';
//     query += ' JOIN supplier_certificate sc ON scb.certificate_id = sc.certificate_id';
//   }
//   // Join with the category table
//   if (category) {
//     if (query.includes('JOIN')) {
//       query += ` AND c.category_name = $${queryParams.push(category)}`;
//     } else {
//       query += ` JOIN category c ON p.category_id = c.category_id AND c.category_name = $${queryParams.push(category)}`;
//     }
//   }


//   if (keyword) {
//     if (query.includes('WHERE')) {
//       query += ` AND ((p.product_name ILIKE $${queryParams.push(`%${keyword}%`)}) OR (p.product_description ILIKE $${queryParams.push(`%${keyword}%`)}))`;
//     } else {
//       query += ` WHERE ((p.product_name ILIKE $${queryParams.push(`%${keyword}%`)}) OR (p.product_description ILIKE $${queryParams.push(`%${keyword}%`)}))`;
//     }
//   }
  

  
  

//   // Handle Min Order Quantity filter
//   if (minOrderQuantity) {
//     minOrderQuantity ===  parseInt(minOrderQuantity);
//     query += ` WHERE p.quantity >= $${queryParams.push(minOrderQuantity)}`;
//   }

//   // Handle Product Certification filter
//   if (productCertificates) {
//     if (query.includes('WHERE')) {
//       query += ` AND pcb.certificate_id IN (SELECT certificate_id FROM product_certificate WHERE certificate_name = $${queryParams.push(productCertificates)})`;
//     } else {
//       query += ` WHERE pcb.certificate_id IN (SELECT certificate_id FROM product_certificate WHERE certificate_name = $${queryParams.push(productCertificates)})`;
//     }
//   }

//   // Handle Manufacturer Location filter (example, add other filters similarly)
//   if (manufacturerLocation) {
//     if (query.includes('WHERE')) {
//       query += ` AND p.manufacturer_location = $${queryParams.push(manufacturerLocation)}`;
//     } else {
//       query += ` WHERE p.manufacturer_location = $${queryParams.push(manufacturerLocation)}`;
//     }
//   }

//   // Handle Supplier Certification filter
//   if (productCertificates) {
//     if (query.includes('WHERE')) {
//       query += ` AND sc.certificate_name = $${queryParams.push(productCertificates)}`;
//     } else {
//       query += ` WHERE sc.certificate_name = $${queryParams.push(productCertificates)}`;
//     }
//   }

//   // Handle Price Range filter
//   if (priceRange) {
//     const [minPrice, maxPrice] = priceRange.split('-');
//     if (minPrice && maxPrice) {
//       if (query.includes('WHERE')) {
//         query += ` AND p.price BETWEEN $${queryParams.push(minPrice)} AND $${queryParams.push(maxPrice)}`;
//       } else {
//         query += ` WHERE p.price BETWEEN $${queryParams.push(minPrice)} AND $${queryParams.push(maxPrice)}`;
//       }
//     }
//   }

//   // Handle Available in USA filter
//   if (availableInUSA) {

//     if (query.includes('WHERE')) {
//       query += ' AND p.in_usa = true';
//     } else {
//       query += ' WHERE p.in_usa = true';
//     }
//   }

//   // Execute the SQL query and return the filtered data
//   db.query(query, queryParams)
//     .then((filteredData) => {
//       res.json(filteredData);
//     })
//     .catch((error) => {
//       console.error('Error executing filter query:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     });
// });



// router.get('/location/:location', async (req,res) =>
// {

//     try{
//         const users = await db.query(`SELECT * FROM products where manufacturer_location='${req.params.location.slice(1)}'`);
//         console.log("users>>>>>>>", users)
//         res.send(users);
//     }
//     catch(e)
//     {
//         res.status(404).send("Error")
//     }
// })  


// router.get('/checker/:checker', async (req,res) =>
// {

//     try{
//         const users = await db.query(`SELECT * FROM products where in_usa=${req.params.checker.slice(1)}`);
//         res.send(users);
//     }
//     catch(e)
//     {
//         res.status(404).send("Error")
//     }
// })  

// router.get('/quantity', async (req,res)=>
// {
//     try{
//         const users = await db.query("SELECT * from products order by quantity ;");
//         res.send(users)
//     }
//     catch(e)
//     {
//         res.status(404).send("Error")
//     }
// })


// router.get('/latest', async (req,res)=>
// {
//     try{
//         const users = await db.query("SELECT * from products order by created_date desc ;");
//         res.send(users)
//     }
//     catch(e)
//     {
//         res.status(404).send("Error")
//     }
// })


// router.get('/certificate/:certificate',  async(req,res) =>
// {

  
//   const certificate  = req.params.certificate.slice(1);
  
  
  
//   try{
  
//               const users = await db.query(`SELECT * from products where  product_id = (select product_id from product_certificate_bridge where certificate_id = (select certificate_id 
  
//                   from product_certificate where certificate_name = '${certificate}')) `);
  
//               res.send(users);
  
//   }
  
//   catch(e)
  
//   {
  
//       res.status(404).send("Error")
  
//   }
// })


// router.get('/category',  async(req,res) =>
// {
//   // const NAME= req.params.name.slice(1);
//   try{
//       const categoriesResult = await db.query("SELECT category_name, category_id, parent_category_id FROM category;");
      
//       const categoryMap = {};

//       categoriesResult.forEach((category) => {
//           const { category_name, category_id, parent_category_id } = category;
//           if (!parent_category_id) {
//             categoryMap[category_id] = { category_id, category_name, children: [] };
            
//           } else {
//             if (!categoryMap[parent_category_id]) {
//               categoryMap[parent_category_id] = { children: [] };
//             }
//             categoryMap[parent_category_id].children.push({ category_id, category_name });
//           }

        
//         });

    
//         const allCategories = Object.values(categoryMap);
//         console.log(allCategories)
//         res.send(allCategories)

//   }
//   catch(e)
//   {
//       res.status(500).send("Error")
//   }
// })


// router.get('/:name',  async(req,res) =>
// {
//         const NAME= req.params.name.slice(1);
//     try{
//                 const users = await db.query(`SELECT * from products where category_id = (SELECT category_id FROM  category where  category_name='${NAME}'); `);
//                 res.send(users);
//     }
//     catch(e)
//     {
//         res.status(404).send("Error")
//     }
// })



// router.get('/:low/:high',  async(req,res) =>
// {
//     const lower_limit  = req.params.low.slice(1);
//     const upper_limit  = req.params.high.slice(1);

//     try{
//                 const users = await db.query(`SELECT * from products where  price between ${lower_limit} and ${upper_limit}; `);
//                 res.send(users);
//     }
//     catch(e)
//     {
//         res.status(404).send("Error")
//     }
// })




// router.get('/price/asc',  async(req,res) =>
// {
//         //const NAME= req.params.name;
//     try{
//                 const users = await db.query(`SELECT * from products  ORDER BY price ; `);
//                 res.send(users);
//     }
//     catch(e)
//     {
//         res.status(404).send("Error")
//     }
// })

// router.get('/price/desc',  async(req,res) =>
// {
//         //const NAME= req.params.name;
//     try{
//                 const users = await db.query(`SELECT * from products  ORDER BY price DESC; `);
//                 res.send(users);
//     }
//     catch(e)
//     {
//         res.status(404).send("Error")
//     }
// })

module.exports = router