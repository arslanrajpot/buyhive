import { Box, List, ListItem, ListItemText, TextField, Link, Typography, FormControlLabel, Checkbox } from '@mui/material'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components';
import Categories from './Categories';

const StyledTextField = styled(TextField).attrs((props) => ({
  fullWidth: true,
  size: "small",
  inputProps: {
    style: {
      fontSize: 14,
    },
  },
  required: true,
}))`
  margin-bottom: 4px !important;
`;

const StyledPriceField = styled(TextField).attrs((props) => ({
  size: "small",
  type: 'number',
  inputProps: {
    style: {
      fontSize: 14,
      width: 100
    },
  },
  required: true,
}))`
  margin-bottom: 0px !important;
`;

const StyledImage = styled.img`
    width: 25px;
    height: 25px;
    margin-right: 10px;
`
var local_state = null;

function SideFilters({locations, productCertificates: product_Certificates, supplierCertificates: supplier_Certificates, minPrice, maxPrice, categories, filterData, currentCategory, searchKeyword, fetchData}) {
  // console.log("curret=nt category", currentCategory)
  const [minOrderQuantity, setMinOrderQuantity] = useState(null)
  const [availableInUSA, setAvailableInUSA] = useState(false)
  const [category, setCategory] = useState(currentCategory)
  const [manufacturerLocation, setManufacturerLocation] = useState(locations.reduce((hash, loc) => {
    hash[loc.manufacturer_location] = false;
    return hash;
  }, {}))

  const [filteredCategories, setFilteredCategories] = useState(categories)
  const [filteredLocations, setFilteredLocations] = useState(locations)
  const [filteredProductCertificates, setFilteredProductCertificates] = useState(product_Certificates)
  const [filteredSupplierCertificates, setFilteredSupplierCertificates] = useState(supplier_Certificates)

  
  const [productCertificates, setProductCertificates] = useState(product_Certificates.reduce((hash, certificate) => {
    hash[certificate.certificate_name] = false;
    return hash;
  }, {}))
  const [supplierCertificates, setSupplierCertificates] = useState(supplier_Certificates.reduce((hash, certificate) => {
    hash[certificate.certificate_name] = false;
    return hash;
  }, {}))

  const [lowerPrice, setLowerPrice] = useState(minPrice[0]?.min)
  const [higherPrice, setHigherPrice] = useState(maxPrice[0]?.max)

  const [categorySearch, setCategorySearch] = useState("")
  const [locationSearch, setLocationSearch] = useState("")
  const [productCertificateSearch, setProductCertificateSearch] = useState("")
  const [supplierCertificateSearch, setSupplierCertificateSearch] = useState("")

  local_state = {
    minOrderQuantity,
    manufacturerLocation,
    lowerPrice, 
    higherPrice,
    availableInUSA,
    productCertificates,
    supplierCertificates,
    category: currentCategory,
    keyword: searchKeyword,
  }

  const compute_query_params = () => {

    // console.log("fro=m compute:", local_state)
    // console.log("fro=m compute:", Object.keys(local_state.manufacturerLocation).filter( key => local_state.manufacturerLocation[key] === true )    )
    return {
      minOrderQuantity: local_state.minOrderQuantity,
      manufacturerLocation: Object.keys(local_state.manufacturerLocation).filter( key => local_state.manufacturerLocation[key] === true ),
      priceRange: `${local_state.lowerPrice}-${local_state.higherPrice}`,
      availableInUSA: local_state.availableInUSA,
      productCertificates: Object.keys(local_state.productCertificates).filter( key => local_state.productCertificates[key] === true ),
      supplierCertificates: Object.keys(local_state.supplierCertificates).filter( key => local_state.supplierCertificates[key] === true ),
      category: local_state.category,
      keyword: local_state.keyword,
    }
  }

  console.log("categories:", filteredCategories)

  const handleSearchLocation = (e) => {
    setLocationSearch(e.target.value)
    setFilteredLocations(locations.filter((obj) =>
      obj.manufacturer_location.toLowerCase().includes(e.target.value.toLowerCase())
    ))
  }

  const handleSearchProductCertificate = (e) => {
    setProductCertificateSearch(e.target.value)
    setFilteredProductCertificates(product_Certificates.filter((obj) =>
      obj.certificate_name.toLowerCase().includes(e.target.value.toLowerCase())
    ))
  }

  const handleSearchSupplierCertificate = (e) => {
    setSupplierCertificateSearch(e.target.value)
    setFilteredSupplierCertificates(supplier_Certificates.filter((obj) =>
      obj.certificate_name.toLowerCase().includes(e.target.value.toLowerCase())
    ))
  }

  const handleSearchCategory = (e) => {
    // console.log("handle searc: ", e.target.value)
    // console.log("handle searc categories: ", filteredCategories)
    setCategorySearch(e.target.value)
    setFilteredCategories(categories.filter((obj) =>
      obj.category_name.toLowerCase().includes(e.target.value.toLowerCase())
    ))
  }

  // console.log("queryParams:", compute_query_params())

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Box sx={{ border: '0.5px solid #eee', borderRadius: '2px', px: 3, py: 3 }}>
      { (categories && categories.length != 0) && (
        <Box>
          <StyledTextField
            placeholder="Enter Category Name"
            value={categorySearch}
            onChange={handleSearchCategory}
          />
          <Box sx={{ml: -2}}>
            <Categories categories={filteredCategories} fetchData={fetchData} />
          </Box>
        </Box>
      ) }
      
        <Box sx={{ mt: 5 }}>
          <Typography sx={{ textAlign: 'left', fontWeight: 600, mb: 2 }}>
            Price
          </Typography>
          {console.log({minPrice, maxPrice})}
          <Box sx={{ display: 'flex' }}>
            <StyledPriceField
              placeholder='Lower Range'
              value={lowerPrice}
              onChange={e => { setLowerPrice(e.target.value); local_state={...local_state, lowerPrice: e.target.value}; filterData(compute_query_params());}}
            />
            <Box sx={{ mx: 2 }}> - </Box>
            <StyledPriceField
              placeholder='Higher Range'
              value={higherPrice}
              onChange={e => { setHigherPrice(e.target.value); local_state={...local_state, higherPrice: e.target.value}; filterData(compute_query_params());}}
            />
          </Box>
        </Box>

        <Box sx={{ mt: 5 }}>
          <Typography sx={{ textAlign: 'left', fontWeight: 600, mb: 2 }}>
            MOQ
          </Typography>
          <Box sx={{ display: 'flex' }}>
            <StyledTextField
              placeholder='Less Than'
              type="number"
              value={minOrderQuantity}
              onChange={(e) => { setMinOrderQuantity(e.target.value); local_state={...local_state, minOrderQuantity: e.target.value}; filterData(compute_query_params());}}
            />
          </Box>
        </Box>

        { (product_Certificates && product_Certificates.length != 0) && (
          <Box sx={{ mt: 5 }}>
            <Typography sx={{ textAlign: 'left', fontWeight: 600, mb: 2,  }}>
              Product Certification
            </Typography>
            <Box sx={{ mb: 1 }}>
              <StyledTextField
                placeholder='Product Certification...'
                value={productCertificateSearch}
                onChange={handleSearchProductCertificate}
              />
            </Box>
            <Box sx={{ textAlign: 'left' }}>
              {filteredProductCertificates.map((cert) => (
                <Box sx={{ mb: -1 }}>
                  <FormControlLabel
                    control={<Checkbox size='small' value={productCertificates[cert.certificate_name]} onChange={(e) => {
                      setProductCertificates({...productCertificates, [cert.certificate_name]: !productCertificates[cert.certificate_name]}); 
                      local_state.productCertificates={...local_state.productCertificates, [cert.certificate_name]: !local_state.productCertificates[cert.certificate_name]}; 
                      filterData(compute_query_params());} 
                    } />}
                    
                      label={<Typography sx={{ fontSize: 14, ml: 1 }}>{cert.certificate_name}</Typography>}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        ) }
        
        { (supplier_Certificates && supplier_Certificates.length != 0) && (
          <Box sx={{ mt: 5 }}>
            <Typography sx={{ textAlign: 'left', fontWeight: 600, mb: 2,  }}>
            Supplier Certification
            </Typography>
            <Box sx={{ mb: 1 }}>
              <StyledTextField
                placeholder='Supplier Certification...'
                value={supplierCertificateSearch}
                onChange={handleSearchSupplierCertificate}
              />
            </Box>
            <Box sx={{ textAlign: 'left' }}>
              {filteredSupplierCertificates.map((cert) => (
                <Box sx={{ mb: -1 }}>
                  <FormControlLabel
                    control={<Checkbox size='small' value={supplierCertificates[cert.certificate_name]} onChange={(e) => {
                      setSupplierCertificates({...supplierCertificates, [cert.certificate_name]: !supplierCertificates[cert.certificate_name]});
                      local_state.supplierCertificates={...local_state.supplierCertificates, [cert.certificate_name]: !local_state.supplierCertificates[cert.certificate_name]};
                      filterData(compute_query_params()); 

                    }} />}
                    label={<Typography sx={{ fontSize: 14, ml: 1 }}>{cert.certificate_name}</Typography>}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        ) }
        
        { (filteredLocations && filteredLocations.length != 0) && (
          <Box sx={{ mt: 5 }}>
            <Typography sx={{ textAlign: 'left', fontWeight: 600, mb: 2,  }}>
              Manufacturer Location
            </Typography>
            <Box sx={{ mb: 1 }}>
              <StyledTextField
                placeholder='Manufacturer Location...'
                value={locationSearch}
                onChange={handleSearchLocation}
              />
            </Box>
            <Box sx={{ textAlign: 'left' }}>
              {filteredLocations.map((loc) => (
                <Box sx={{ mb: -1 }}>
                  <FormControlLabel
                    control={<Checkbox size='small' value={manufacturerLocation[loc.manufacturer_location]} onChange={(e) => {
                      setManufacturerLocation({...manufacturerLocation, [loc.manufacturer_location]: !manufacturerLocation[loc.manufacturer_location]});
                      local_state.manufacturerLocation={...local_state.manufacturerLocation, [loc.manufacturer_location]: !local_state.manufacturerLocation[loc.manufacturer_location]};
                      console.log("from inside:", local_state)
                      filterData(compute_query_params());
                    } } />}
                    
                      label={<Typography sx={{ fontSize: 14, ml: 1 }}>{loc.manufacturer_location}</Typography>}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        ) }
        

        <Box sx={{ mt: 5 }}>
          <Typography sx={{ textAlign: 'left', fontWeight: 600, mb: 2,  }}>
            Stock Availability
          </Typography>
          <Box sx={{ textAlign: 'left' }}>
            <Box sx={{ mb: -1 }}>
              <FormControlLabel
                control={<Checkbox size='small' value={availableInUSA} onChange={(e) => { setAvailableInUSA(!availableInUSA); local_state={...local_state, availableInUSA: !local_state.availableInUSA}; filterData(compute_query_params()); }} />}
                label={<Typography sx={{
                  fontSize: 14,
                  ml: 1,
              }}>
                  <StyledImage src='https://thebuyhive.com/buy/img/usa.cbfe8d83.svg' alt='usa' />
                  In USA 
              </Typography>}
              />
            </Box>
          </Box>
        </Box>

      </Box>
    </Box>
  )
}

export default SideFilters