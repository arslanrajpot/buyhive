import React from 'react'

const dropdownStyle = {
  backgroundColor: 'rgba(35,31,32,.15) ',
  marginTop:'50px',
  width: '150px',
  height: '30px',
  borderRadius: '20px',
  border:'none'
};



export default function SortBy({handleSortby}) {

  const handleDropdownChange = (event) => {
    const selectedValue = event.target.value;
    handleSortby(selectedValue); 
  }
  return (
    <div>

          <select id="sort_by" style={dropdownStyle} onChange= {handleDropdownChange} >
            <option value='Defaulat'>Relevance</option>
            <option value='latest'>Latest</option>
            <option value='price-desc'>Price High To Low</option>
            <option value='price-asc'>Price Low To High</option>
            <option value='moq-asc'>MOQ Low To High</option>
          </select >


    </div>
  )
}
