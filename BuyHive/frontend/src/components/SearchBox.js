import React, { useState } from 'react';
import Button from '@mui/material/Button'
import CategoriesDialogues from './dialogues/CategoriesDialogues';
import Categories from './Categories';
import { Box, List, ListItem, Typography, Link } from '@mui/material';

export default function SearchBar({categories, currentCategory, setCurrentCategory, fetch_method, searchKeyword, setSearchKeyword}) {
  const [showCategories, setShowCategories] = useState(false);

  const toggleCategories = () => {
    setShowCategories(!showCategories);
  };

  return (
    <div className='container'>
      {/* <CategoriesDialogues
        open={showCategories}
        setOpen={setShowCategories}
        categories={categories.allCategories}
      /> */}

      <div className='searchDiv'>
        {/* <a className='categoryLink' onClick={toggleCategories}>
          Categories
        </a> */}
        <Button variant='contained' size='small' onClick={toggleCategories}>
          Categories
        </Button>

        <input className='form-control searchField' placeholder='What are you looking for?' value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />        
          <select className='dropdown' id="category_name">
            <option value='All Categories'>All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category.category_name}>
                {category.category_name}
              </option>
            ))}
          </select>
        <Button variant='contained' onClick={() => { setCurrentCategory(document.getElementById('category_name').value); fetch_method(document.getElementById('category_name').value, searchKeyword); }} >Search</Button>
      </div>
      {
        showCategories && (
        <Box sx={{display: 'flex', pl: 3, pt:3}} className='categories'>
          { categories.map((category) => (
            <Box sx={{mr: 2}}>
              <Link href="#" sx={{ fontWeight: 600, textDecoration: 'none' }} onClick={(e) => {e.preventDefault(); fetch_method(e.target.text);}}>{category.category_name}</Link>
              <List dense={true} sx={{ml: 0}} className='subCategories'>
              { category.children ? category.children.map((subCategory) => (
                <>
                  <ListItem sx={{ fontSize: '14px', fontWeight: 400 }}>
                  <Link href="#" sx={{ textDecoration: 'none', color: '#111' }} onClick={(e) => {e.preventDefault(); fetch_method(e.target.text);}}>
                    {subCategory.category_name}
                  </Link>
                  </ListItem>
                </>
              )) : null }
            </List>

            </Box>
          )) }
          
        </Box>)
      }
      {/* {showCategories && (
          <div className='categories'>
            {categories.map((category, index) => (
              <div key={index} className='category'>
                <h4>{category.categoryName}</h4>
                <ul className='subCategories'>
                  {category.subCategories.map((subCategory, subIndex) => (
                    <li key={subIndex}>{subCategory}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )} */}
    </div>
  );
}

