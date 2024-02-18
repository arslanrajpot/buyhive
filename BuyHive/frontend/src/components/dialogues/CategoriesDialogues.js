import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Box } from "@mui/system";
import { Typography } from "@mui/material";

export default function CategoriesDialogues({ open, setOpen, categories }) {
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      {/* <DialogTitle id="alert-dialog-title">
        {title ? title : "Alert"}
      </DialogTitle> */}
      <DialogContent>
        <div className='categories'>
          {categories.map((category, index) => (
            <div key={index} className='category'>
              <h4>{category.category_name}</h4>
              <ul className='subCategories'>
                {category.children ? category.children.map((subCategory, subIndex) => (
                  <li key={subIndex}>{subCategory.category_name}</li>
                )) : null}
              </ul>
            </div>
          ))}
        </div>   
      </DialogContent>
    </Dialog>
  );
}
