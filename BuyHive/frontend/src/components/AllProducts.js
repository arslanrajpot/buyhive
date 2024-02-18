import React from 'react'
import { useState, useEffect } from 'react'
import CardComponent from './CardComponent';

function AllProducts() {
    const [data, setData] = useState([]);
    useEffect(() => {
        fetch('http://localhost:5555/products')
          .then((response) => response.json())
          .then((result) => {
            setData(result);
          });
      }, []);

  return (
<div className='container '>
  <div className='row mb-4 mt-4 '>
    { console.log("data", data) }
    {data && data.map((product) => (
      <div className='col-md-4 mb-4' key={product.product_id}>
        <CardComponent product={product} />
      </div>
    ))}
  </div>
</div>

  )
}

export default AllProducts