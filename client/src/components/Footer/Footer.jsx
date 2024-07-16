import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function Footer() {


  return (
    <Box displayPrint={"none"}
      component="footer"
      sx={{
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        mt: 'auto',
        py: [3, 2],
        backgroundColor: 'grey.100',
        '@media print and (min-width: 320px)': {
          marginTop: '80px'
        },
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      <Typography textAlign="center" variant="h6">© 2023 Company, Inc.</Typography>
    </Box>
  )
}

export default Footer