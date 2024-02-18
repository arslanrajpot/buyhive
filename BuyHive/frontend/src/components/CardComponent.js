import React from 'react'
import img from '../images/log.jpeg'
export default function CardComponent(props) {
  const {product} = props;
  
  return (
    <div>
      {product? (
        <div className="card card_container" >
          <img src={img} style={{height:"200px", width:"200px"}} className="card-img-top" alt="..." />
          <div className="card-body">
              <p className="card-text" style={{ marginBottom: "4px" }}>{product.in_usa?"Available in USA":""}</p>
              <p className="card-text" style={{ marginBottom: "4px" }}>{product.product_name}</p>
              <p className="card-text" style={{ marginBottom: "4px" }}>
                  {product.product_description}
              </p>
              <h5 className="card-text" style={{ marginTop: "8px" }}>{product.price}</h5>
              <a href="#" className="btn btn-primary"  id="cart_button">Add to Cart</a>
          </div>
        </div>)
        :""}
    </div>
  )
}

