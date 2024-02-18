import * as React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, Button } from '@mui/material';
import { truncate } from '../../utils';
import { styled } from 'styled-components'

const StyledImage = styled.img`
    width: 30px;
    height: 30px;
    margin-right: 10px;
`


export default function ProductCard({product}) {
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card sx={{ maxWidth: 280, px: 2, py: 2 }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        
      }}>
        <CardMedia
            component="img"
            height="200"
            // image="https://mui.com/static/images/cards/paella.jpg"
            image={product.image}
            alt="Paella dish"
            sx={{
                // height: "200px",
                // width: "auto",
            }}
        />
      </Box>
      <CardContent sx={{ textAlign:'left' }}>
        <Typography sx={{
            fontSize: 11,
            mb: 0.4,
            mt: -1,
            height: '30px'
        }}>
          {
            product.in_usa === "true" ? (
              <>
                <StyledImage src='https://thebuyhive.com/buy/img/usa.cbfe8d83.svg' alt='usa' />
                Stock in USA 
              </>
            ) : null
          }
            
        </Typography>
      <Typography variant="body">  
            { truncate(product.product_name) }
            
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {`MOQ: ${product.quantity} Boxes`}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 700, color: 'black', fontSize: 16 }}>
            {`$ ${product.price} / Box`}
        </Typography>
        
        
      </CardContent>
      <CardActions disableSpacing>
        <Button variant='contained' size="small" sx={{ width: '100%' }}> Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
}