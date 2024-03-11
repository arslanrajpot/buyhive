const express = require('express');
const router = express.Router();
const productRoutes = require('./productRoutes')
const categoryRoutes = require('./categoryRoutes')

router.use('/products', productRoutes)
router.use('/categories', categoryRoutes)

router.use((req,res,next)=>{
  const error= new Error('Not Found');
  error.status=404
  next(error)
  
})

router.use((error,req,res,next)=>{
  res.status(error.status || 500)
  res.json({
    error :{
      message: error.message
    }
  });
})

module.exports = router;