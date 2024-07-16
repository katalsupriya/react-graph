import React, { forwardRef, useImperativeHandle, useRef, useState, memo } from 'react';
import { chartConfig } from '../../config';
import { styled } from '@mui/system';
import Box from '@mui/material/Box';
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bubble } from 'react-chartjs-2';
import { lightGreen, orange, red, yellow } from '@mui/material/colors';
import { Stack } from '@mui/material';

// register controller
ChartJS.register(LinearScale, PointElement, Legend, Tooltip, ChartDataLabels);

const BarChart = memo(
	forwardRef(function BarChart({ value, bubblePosition}, ref) {
		const initialData = {
			datasets: [
				{
					type: 'bubble',
					backgroundColor: '#455a64',
					borderWidth: 1,
					fill: false,
					data: bubblePosition
				}
			]
		};

		const [data, setData] = useState(initialData);
		const chartRef = useRef(null);

		// control ref
		useImperativeHandle(ref, () => {
			return {
				update() {
					setData(initialData);
					chartRef.current.update();
				},
				resize() {
					chartRef?.current.resize(660, 750)
					setTimeout(() => window.print(), 1000);
				}
			};
		});

		// before print
		window.addEventListener('beforeprint', () => {
			if (chartRef.current !== null) {
		chartRef?.current.resize(660, 750);
			}
		});

		// after print
		window.addEventListener('afterprint', () => {
			if (chartRef.current !== null) {
				chartRef?.current.resize();
			}
		});


		// div element
		const Div = styled('div')(({ theme }) => ({
			position: 'absolute',
			display: 'flex'
		}));

		// stack element
		const Item = styled('div')(({ theme }) => ({
			textAlign: 'center'
		}));

		return (
			<>
				<Stack>
					<Box
						position={'relative'}
						sx={{
							mx: 'auto',
							height: '100%',
							width: '100%',
							'@media screen and (max-width:576px)': {
								fontSize: '13px'
							},
							'@media print and (min-width: 320px)': {
								marginTop: '80px',
								fontSize: '14px',
								width:'660px'
							}
						}}
					>
						<Box
							display={'grid'}
							sx={{
								gridTemplateColumns: `${Number(value.xLow) + '%'} ${Number(value.xAverage) + '%'} ${Number(value.xHigh) + '%'
									}`,
								width: '100%'
							}}
						>
							<Box>
								<Div
									sx={{
										width: Number(value.xLow) + '%',
										height: Number(value.yLow) + '%',
										bottom: 0,
										justifyContent: 'flex-start',
										alignItems: 'center',
										zIndex: Number(value.xLow) === 0 ? 1 : '',
										'&::before': {
											content: '"Low"',
											pl: 2,
											position: 'absolute',
											left: '-32px',
											transform: 'rotate(-90deg)',
											display: Number(value.yLow) === 0 ? 'none' : ''
										},
										printColorAdjust: 'exact',
										WebkitPrintColorAdjust: 'exact',
										backgroundColor: red[300]
									}}
								></Div>
								<Div
									sx={{
										width: Number(value.xLow) + '%',
										height: Number(value.yAverage) + '%',
										bottom: Number(value.yLow) + '%',
										zIndex: 1,
										alignItems: 'center',
										pl: 1,
										backgroundColor: orange.A200,
										'&::before': {
											content: '"Average"',
											pl: 2,
											position: 'absolute',
											left: '-47px',
											transform: 'rotate(-90deg)',
											display: Number(value.yAverage) === 0 ? 'none' : ''
										},
										printColorAdjust: 'exact',
										WebkitPrintColorAdjust: 'exact',
									}}
								></Div>
								<Div
									bottom={Number(value.yAverage) + Number(value.yLow) + '%'}
									sx={{
										width: Number(value.xLow) + '%',
										height: Number(value.yHigh) + '%',
										zIndex: 1,
										alignItems: 'center',
										pl: 1,
										backgroundColor: yellow.A100,
										'&::before': {
											content: '"High"',
											pl: 2,
											position: 'absolute',
											left: '-35px',
											transform: 'rotate(-90deg)',
											display: Number(value.yHigh) === 0 ? 'none' : ''
										},
										printColorAdjust: 'exact',
										WebkitPrintColorAdjust: 'exact',
									}}
								></Div>
							</Box>
							<Box>
								<Div
									sx={{
										width: Number(value.xAverage) + '%',
										height: Number(value.yLow) + '%',
										bottom: '0',
										zIndex: 1,
										alignItems: 'center',
										backgroundColor: orange.A200,
										printColorAdjust: 'exact',
										WebkitPrintColorAdjust: 'exact',
									}}
								></Div>
								<Div
									sx={{
										width: Number(value.xAverage) + '%',
										height: Number(value.yAverage) + '%',
										bottom: Number(value.yLow) + '%',
										justifyContent: 'flex-start',
										alignItems: 'center',
										zIndex: Number(value.xLow) === 0 ? 1 : '',
										backgroundColor: orange[500],
										printColorAdjust: 'exact',
										WebkitPrintColorAdjust: 'exact',
									}}
								></Div>
								<Div
									sx={{
										bottom: Number(value.yAverage) + Number(value.yLow) + '%',
										width: Number(value.xAverage) + '%',
										height: Number(value.yHigh) + '%',
										zIndex: 1,
										alignItems: 'center',
										backgroundColor: yellow[200],
										printColorAdjust: 'exact',
										WebkitPrintColorAdjust: 'exact',
									}}
								>
								</Div>
							</Box>
							<Box>
								<Div
									sx={{
										bottom: 0,
										width: Number(value.xHigh) + '%',
										height: Number(value.yLow) + '%',
										zIndex: 1,
										alignItems: 'center',
										backgroundColor: yellow.A100,
										printColorAdjust: 'exact',
										WebkitPrintColorAdjust: 'exact',
									}}
								></Div>
								<Div
									sx={{
										width: Number(value.xHigh) + '%',
										height: Number(value.yAverage) + '%',
										bottom: Number(value.yLow) + '%',
										zIndex: 1,
										alignItems: 'center',
										backgroundColor: lightGreen.A100,
										printColorAdjust: 'exact',
										WebkitPrintColorAdjust: 'exact',
									}}
								></Div>
								<Div
									sx={{
										width: Number(value.xHigh) + '%',
										height: Number(value.yHigh) + '%',
										bottom: Number(value.yLow) + Number(value.yAverage) + '%',
										justifyContent: 'flex-start',
										alignItems: 'center',
										zIndex: Number(value.xLow) === 0 ? 1 : '',
										backgroundColor: lightGreen[300],
										printColorAdjust: 'exact',
										WebkitPrintColorAdjust: 'exact',
									}}
								></Div>
							</Box>
						</Box>
						<Bubble ref={chartRef} options={chartConfig} data={data} />
						<Stack position={'absolute'} flexDirection={'row'} width={'100%'}>
							<Item sx={{ flexBasis: value.xLow + '%', display: Number(value.xLow) === 0 ? 'none' : '' }}>Low</Item>
							<Item sx={{ flexBasis: value.xAverage + '%', display: Number(value.xAverage) === 0 ? 'none' : '' }}>
								Average
							</Item>
							<Item sx={{ flexBasis: value.xHigh + '%', display: Number(value.xHigh) === 0 ? 'none' : '' }}>High</Item>
						</Stack>
					</Box>
				</Stack>
			</>
		);
	})
);

export default BarChart;
