import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export default function BasicTable({ data, xOmmited, yOmmited }) {
	const rows = data.map((el) => {
		return { index: el.index, name: el.can_nombre + ' ' + el.can_apellido, can_id: el.can_id };
	});

	let getresult =
		(xOmmited !== undefined && xOmmited.length > 0 && xOmmited.split(',')) ||
		(yOmmited !== undefined && yOmmited.length > 0 && yOmmited.split(','));

	const result = rows.filter(
		(x) =>
			(xOmmited !== undefined && xOmmited.length > 0 && !getresult.find((y) => x.can_id === +y)) ||
			(yOmmited !== undefined && yOmmited.length > 0 && !getresult.find((y) => x.can_id === +y))
	);

	return (
		<TableContainer
			component={Paper}
			sx={{ border: '1px solid', borderColor: (theme) => theme.palette.grey[300], maxHeight: '500px' }}
		>
			<Table aria-label="List table">
				<TableHead>
					<TableRow>
						<TableCell sx={{ fontWeight: 700 }}>Index</TableCell>
						<TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.map((row) => (
						<TableRow key={row.index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
							<TableCell component="th" scope="row" sx={{ fontWeight: 700 }}>
								{row.index}
							</TableCell>
							<TableCell
								sx={{
									color: result.map((i) => (i.can_id === row.can_id ? 'red' : ''))
								}}
							>
								{row.name}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
