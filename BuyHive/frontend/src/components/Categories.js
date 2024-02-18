import { Box, List, ListItem, TextField, Link } from '@mui/material';
import React from 'react'
import styled from 'styled-components';

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

function Categories({categories, fetchData}) {
  // console.log("categories:", categories)

  return (
      <List dense={true} sx={{ml: 2}}>
      {
        categories.map((cat) => (
          <>
          <ListItem sx={{ fontSize: '14px', fontWeight: 400 }}>
          <Link href="#" sx={{ textDecoration: 'none', color: '#111' }} onClick={(e) => {e.preventDefault(); console.log("e.target.text:", e.target.text); fetchData(e.target.text);}}>
            {cat.category_name}
          </Link>
          </ListItem>
          { cat.children && cat.children.length != 0 ? <Categories categories={cat.children} filterData={fetchData} /> : null }
          </>
        ))
      }
      </List>
  )
}

export default Categories