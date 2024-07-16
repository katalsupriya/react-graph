import React, { useState } from 'react';
import { Link, useLoaderData} from 'react-router-dom';
import Table from '../../components/DataTable/DataTable';
import FormSelect from '../../components/Select/FormSelect';
import {Box,Grid,Button,Typography,Container} from '@mui/material';

function Home() {
	const candidatesData = useLoaderData();
	const [value, setValue] = useState({
		_NombreDepartamento: '',
		_NombreJerarquia: '',
		_CodigoCargo: '',
		_NombreSucursal: ''
	});

	const [selected, setSelected] = useState([]);

	// handle on change
	const handleChange = (e) => setValue({ ...value, [e.target.name]: e.target.value });

	return (
		<>
			{/* filter section */}
			<Box component={'section'}>
				<Container
					maxWidth="xxl"
					sx={{
						py: 3
					}}
				>
					{/* grid */}
					<Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
						<Grid item xs={12}>
							<Typography variant="h4" fontWeight={600} marginBottom={3}>
								Candidate Details
							</Typography>
							<Typography variant="h6" fontWeight={500} marginBottom={2}>
								Select Filter
							</Typography>
						</Grid>
						<Grid item xs={12} md={3} sm={6}>
							<FormSelect
								name="_NombreDepartamento"
								value={value._NombreDepartamento}
								handleChange={handleChange}
								title="department"
								data={candidatesData}
							></FormSelect>
						</Grid>
						<Grid item xs={12} sm={6} md={3}>
							<FormSelect
								name="_NombreJerarquia"
								value={value._NombreJerarquia}
								handleChange={handleChange}
								title="hierarchy"
								data={candidatesData}
							></FormSelect>
						</Grid>
						<Grid item xs={12} sm={6} md={3}>
							<FormSelect
								name="_CodigoCargo"
								value={value._CodigoCargo}
								handleChange={handleChange}
								title="position"
								data={candidatesData}
							></FormSelect>
						</Grid>
						<Grid item xs={12} sm={6} md={3}>
							<FormSelect
								name="_NombreSucursal"
								value={value._NombreSucursal}
								handleChange={handleChange}
								title="work branch"
								data={candidatesData}
							></FormSelect>
						</Grid>
					</Grid>
					{/* grid */}
				</Container>
			</Box>
			{/* filter section */}
			{/* table */}
			<Box component={'section'}>
				<Container
					maxWidth="xxl"
					sx={{
						py: 3
					}}
				>
					<Table data={candidatesData} selectValue={value} setSelected={setSelected} />
					<Box textAlign="right" sx={{ my: 3 }}>
						<Button
							variant="contained"
							component={Link}
							to="/test-selection"
							state={selected}
							disabled={selected.length === 0 ? true : false}
						>
							Select List
						</Button>
					</Box>
				</Container>
			</Box>
			{/* table */}
		</>
	);
}

export default Home;
