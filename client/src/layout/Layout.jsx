import { Outlet } from 'react-router-dom';
import React from 'react';
import {ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import Box from '@mui/material/Box';
import {theme} from '../theme';
import Header from '../components/Header/Header';
import Toolbar from '@mui/material/Toolbar';
import Footer from '../components/Footer/Footer';

const globalStyles =  <GlobalStyles styles={{ ul: { margin: 0, padding: 0, listStyle: 'none' } }} />;

function Layout() {
	return (
		<>
	  <ThemeProvider theme={theme}>
     {globalStyles}
      <CssBaseline />
      <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}>
     <Header title={"Candidates"}/>
      {/* Hero unit */}
			<Box component="main" >
      <Toolbar />
				<Outlet />
			</Box>
      {/* Footer */}
     <Footer/>
      {/* End footer */}
      </Box>
      </ThemeProvider>
		</>
	);
}

export default Layout;
