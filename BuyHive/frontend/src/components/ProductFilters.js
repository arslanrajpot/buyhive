
import React, { useState, useEffect } from 'react';
import axios from 'axios'

function ProductFilters() {
    const [filters, setFilters] = useState({
        category:'Category 2  ',
        minOrderQuantity:'',
        productCertificates: '',
        manufacturerLocation: '',
        supplierCertificates: '',
        priceRange: '',
        // availableInUSA: false,
        keyword: '' ,
      });

      const [filteredProducts, setFilteredProducts] = useState([]);

      useEffect(() => {
        const fetchFilteredProducts = async () => {
          try {
            const response = await axios.get('http://localhost:5555/products/filter', {
              params: filters,
            });
            setFilteredProducts(response.data);
          } catch (error) {
            console.error('Error fetching filtered products:', error);
          }
        };
      
        // Call the fetchFilteredProducts function whenever 'filters' change
        fetchFilteredProducts();
      }, [filters]); // 'filters' is added as a dependency
      
    
      const handleFilterChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFilters((prevFilters) => ({
          ...prevFilters,
          [name]: type === 'checkbox' ? checked : value,
        }));
      };
    
    


  return (
    <div>

        <label>
            Category:
            <input
            type="text"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            />
        </label>




        <label>
            Minimum Order Quantity:
            <input
            type="number"
            name="minOrderQuantity"
            value={filters.minOrderQuantity}
            onChange={handleFilterChange}
            />
        </label>

        <label>
        Product Certification:
        <input
          type="text"
          name="productCertificates"
          value={filters.productCertificates}
          onChange={handleFilterChange}
        />
      </label>

      <label>
        Manufacturer Location:
        <input
          type="text"
          name="manufacturerLocation"
          value={filters.manufacturerLocation}
          onChange={handleFilterChange}
        />
      </label>

      <label>
        Supplier Certification:
        <input
          type="text"
          name="supplierCertificates"
          value={filters.supplierCertificates}
          onChange={handleFilterChange}
        />
      </label>


      <label>
        Price Range:
        <input
          type="text"
          name="priceRange"
          value={filters.priceRange}
          onChange={handleFilterChange}
        />
      </label>


      <div>
          {filteredProducts.map((product) => (

          <div key={product.product_id}>
            <p>{product.product_name}</p>
            {/* Display other product details */}
          </div>
        ))}
      </div>




    </div>
  )
}

export default ProductFilters