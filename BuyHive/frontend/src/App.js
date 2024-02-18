import './App.css';
import CardComponent from './components/CardComponent';
import Navbar from './components/Navbar'
import SearchBox from './components/SearchBox';
import AllProducts from './components/AllProducts';
import ProductFilters from './components/ProductFilters';
import AllData from './components/AllData';
import ProductCard from './components/cards/ProductCard';
import { Box, Grid, TextField, Typography } from '@mui/material';
import styled from 'styled-components';
import SideFilters from './components/SideFilters';
import { useEffect, useState } from 'react';
import axios from 'axios';
import SortBy from './components/SortBy';

function App() {
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState(null);
  const [error, setError] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortby,setSortby] =useState("");

  const handleSortby=(selectedValue)=>{
    setSortby(selectedValue)
  }

  console.log("From SortBy",sortby,"object");

  const fetchData = async (category_name, keyword="") => {
    axios.get(`http://localhost:5555/products?category_name=${category_name}&keyword=${keyword}`) // Replace with your actual API endpoint
      .then((response) => {
        setData(response.data);
        setFilteredProducts(null)
      })
      .catch((err) => {
        setError(err);
      });
  }

  const filterData = async (queryParams) => {
    const requestParams ={
      ...queryParams,
      sortby
      
    }
    console.log("From SortBy",sortby,"query params");
    console.log("queryParams: from filter data ", requestParams)
    axios.get(`http://localhost:5555/products/filter`, { params : requestParams }) 
      .then((response) => {
        setFilteredProducts(response.data);
      })
      .catch((err) => {
        setError(err);
      });
  }

  // useEffect(() => {
  //   filterData();
  // }, [sortby]);

  

  useEffect(() => {
    // Make an API request to fetch data from the backend
    axios.get('http://localhost:5555/products') 
      .then((response) => {
        setData(response.data);
      })
      .catch((err) => {
        setError(err);
      });
    
    axios.get('http://localhost:5555/categories')
      .then((response) => {
        // console.log("response.data:", response.data)
        setCategories(response.data);
        // console.log(response, response.data)
      })
      .catch((err) => {
        setError(err);
      });
    
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!(data && categories)) {
    return <div>Loading...</div>;
  }

  // Now you can access the data received from the backend
  const { products, subCategories, minPrice, maxPrice, location, productCertificate, supplierCertificate } = data;

  console.log({products, subCategories, minPrice, maxPrice, location, productCertificate, supplierCertificate})

  console.log(categories)

  return (
    <div className="App">
      <Navbar/>
      <SearchBox searchKeyword={searchKeyword} setSearchKeyword={setSearchKeyword} categories={categories} currentCategory={currentCategory} setCurrentCategory={setCurrentCategory} fetch_method={fetchData} />
      {/* <AllProducts/>  */}
      {/* <ProductFilters/>     */}
      {/* <AllData/>  */}

      <Box
        sx={{
          display: "flex",
          // border: "1px solid #eee",
          // borderRadius: 2,
        }}
      >
        <Box sx={{width: '35vw', pl: 5}}>
          <Typography>Products({(filteredProducts ? filteredProducts : products).length})</Typography>
          <SideFilters
            // allCategories,subCategories, minPrice, maxPrice, location, productCertificate, supplierCertificate]} 
            locations = {location} 
            productCertificates = {productCertificate}
            supplierCertificates = {supplierCertificate}
            maxPrice = {maxPrice}
            minPrice = {minPrice}
            categories = {subCategories}
            filterData = {filterData}
            fetchData = {fetchData}
            currentCategory={currentCategory}
            searchKeyword={searchKeyword}
  
          />
        </Box>
        <Box sx={{ width: '65vw' }}>
        {/* <SortBy handleSortby ={handleSortby} ></SortBy> */}
        <Grid container>
          { (filteredProducts ? filteredProducts : products).length != 0 ? ((filteredProducts ? filteredProducts : products).map((product) => (
            <Grid item sm={4}>
              <ProductCard product={product} />
            </Grid>

          ))) : <Box sx={{width: '100%', mt: 5, height: "50vh", display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Typography sx={{fontSize: 20, textAlign: 'center'}}><i>No Products Found.</i></Typography></Box> }
          </Grid>
        </Box>
      </Box>

    </div>
  );
}

export default App;
