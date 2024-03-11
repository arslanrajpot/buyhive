import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AllData = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Make an API request to fetch data from the backend
    axios.get('http://localhost:5555/products') // Replace with your actual API endpoint
      .then((response) => {
        setData(response.data);
      })
      .catch((err) => {
        setError(err);
      });
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  // Now you can access the data received from the backend
  const { products, allCategories,subCategories, minPrice, maxPrice, location, productCertificate, supplierCertificate } = data;

  console.log({products, allCategories,subCategories, minPrice, maxPrice, location, productCertificate, supplierCertificate})

  return (
    <div>
        <div>
            <h2>Products</h2> 
            <ul>
                {products && products.map((product) => (
                <li key={product.product_id}>{product.product_name}</li>
                ))}
            </ul>
        </div>

        <div>
            <h2>Categories</h2>
            <ul>
                {allCategories && allCategories.map((parentCategory) => (
                <li key={parentCategory.category_id}>
                    {parentCategory.category_name}
            <ul>
                {parentCategory.children.map((subcategory) => (
                <li key={subcategory.category_id}>{subcategory.category_name}</li>
                ))}
            </ul>
                </li>
                ))}
            </ul>
        </div>


        <div>
            <h2>Sub Categories</h2> 
            <ul>
                {subCategories && subCategories.map((subCategories) => (
                <li key={subCategories.category_id}>{subCategories.category_id}</li>
                ))}
            </ul>
        </div>


        <div>
            <h2>Price Range</h2>
            <p>Minimum Price: ${minPrice && minPrice[0].min}</p>
            <p>Maximum Price: ${maxPrice && maxPrice[0].max}</p>
        </div>




        <div>
            <h2>Locations</h2>
            <ul>
                {location && location.map((locationItem) => (
                <li key={locationItem.manufacturer_location}>{locationItem.manufacturer_location}</li>
                ))}
            </ul>
        </div>

        <div>
            <h2>Product Certificates</h2>
            <ul>
                {productCertificate && productCertificate.map((certificate) => (
                <li key={certificate.certificate_name}>{certificate.certificate_name}</li>
                ))}
            </ul>
            </div>

            <div>
            <h2>Supplier Certificates</h2>
            <ul>
                {supplierCertificate && supplierCertificate.map((certificate) => (
                <li key={certificate.certificate_name}>{certificate.certificate_name}</li>
                ))}
            </ul>
        </div>





    </div>
  );
};

export default AllData;
