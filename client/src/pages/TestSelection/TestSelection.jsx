import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLoaderData, useLocation, useNavigate } from 'react-router-dom';
import {
	FormHelperText,
	Box,
	Grid,
	Button,
	Typography,
	Container,
	FormControl,
	Select,
	MenuItem,
	TextField,
	Alert,
	Snackbar
} from '@mui/material';
import BarChart from '../../components/Chart/Chart';
import { flushSync } from 'react-dom';
import Table from '../../components/ListTable/ListTable';
import { axis, bubbleRadius, chartConfig } from '../../config';

function TestSelection() {
	const routeData = useLoaderData();
	const navigate = useNavigate();
	const { state } = useLocation();
	const chartRef = useRef(null);
	const [isPrint, setPrint] = useState(false);
	const [isSnackbar, setSnackbar] = useState({
		open: false,
		vertical: 'bottom',
		horizontal: 'center'
	});
	const [value, setValue] = useState({
		xAxis: 'razi',
		yAxis: 'razi',
		profile: '',
		raziNorm: 'Norma Estandar',
		aplNorm: '',
		candidates: [],
		xLow: 25,
		xAverage: 25,
		xHigh: 50,
		yLow: 25,
		yAverage: 25,
		yHigh: 50,
		aplWeight: 50,
		raziWeight: 50
	});

	const [position, setPosition] = useState([]);

	const [isValid, setValid] = useState({
		profile: false,
		aplNorm: false,
		chartError: false,
		horizontalChartError: false,
		verticalChartError: false
	});

	const [isGenerated, setGenerated] = useState(false);
	const [candidates, setCandidates] = useState([]);
	const [testData, setTestData] = useState([]);
	const [getXAxis, setXAxis] = useState([]);
	const [getYAxis, setYAxis] = useState([]);

	// when component load
	useEffect(() => {
		async function getSelectedCandidates() {
			if (state) {
				try {
					await fetch('/get/candidates?id=' + state.join(','))
						.then((response) => response.json())
						.then((data) => {
							setCandidates(
								data.map((el, i) => {
									return { ...el, index: i + 1 };
								})
							);
						});

					await fetch('/get/test?id=' + state.join(','))
						.then((response) => response.json())
						.then((data) => setTestData(data));
				} catch (e) {
					console.log(e);
				}
			} else {
				return navigate('/');
			}
		}
		getSelectedCandidates();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state]);
	// #region

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const Chart = useCallback(
		() => <BarChart value={value} ref={chartRef} bubblePosition={position} />,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[isGenerated]
	);

	const { vertical, horizontal, open } = isSnackbar;

	const aplList = [
		...new Set(
			testData
				.flat()
				.filter((el) => (el.pr_estructura === 1 || el.pr_estructura === 2) && el.pr_status === 1)
				.map((el) => el.pr_idCandidato)
		)
	].join(',');

	const raziList = [
		...new Set(
			testData
				.flat()
				.filter((el) => el.pr_estructura === 7 && el.pr_status === 1)
				.map((el) => el.pr_idCandidato)
		)
	].join(',');

	const performanceList = [
		...new Set(
			testData
				.flat()
				.filter((el, i) => el.porcentaje === i.porcentaje)
				.map((el) => el.pr_idCandidato)
		)
	].join(',');

	const handleOmmited = () => {
		let getXAxis =
			value.xAxis === 'razi'
				? raziList
				: value.xAxis === 'apl'
				? aplList
				: value.xAxis === 'performance'
				? performanceList
				: '';

		let getYAxis =
			value.yAxis === 'razi'
				? raziList
				: value.yAxis === 'apl'
				? aplList
				: value.yAxis === 'performance'
				? performanceList
				: '';
		setXAxis(getXAxis);
		setYAxis(getYAxis);
	};

	const horizontalTotal = Number(value.xLow) + Number(value.xAverage) + Number(value.xHigh);
	const verticalTotal = Number(value.yLow) + Number(value.yAverage) + Number(value.yHigh);

	// set validation
	if (isValid.profile && value.profile !== '') setValid({ ...isValid, profile: false });
	else if (isValid.aplNorm && value.aplNorm !== '') setValid({ ...isValid, aplNorm: false });
	else if (value.xAxis === 'performance' && value.yAxis === 'performance' && (isValid.aplNorm || isValid.profile)) {
		setValid({ ...isValid, aplNorm: false, profile: false });
	} else if (value.xAxis === 'razi' && value.yAxis === 'razi' && (isValid.aplNorm || isValid.profile)) {
		setValid({ ...isValid, profile: false, aplNorm: false });
	} else if (
		(isValid.profile || isValid.aplNorm) &&
		((value.xAxis === 'performance' && value.yAxis === 'razi') ||
			(value.xAxis === 'razi' && value.yAxis === 'performance'))
	) {
		setValid({ ...isValid, profile: false, aplNorm: false });
	}

	// #end region

	//#region events

	const handleAxis = (array) => {
		let isX = array.every((el) => el.x < 100);
		let isY = array.every((el) => el.y < 100);
		if (isX && isY) {
			chartConfig.layout.autoPadding = false;
			chartConfig.scales.x.max = 100;
			chartConfig.scales.y.max = 100;
		} else {
			chartConfig.layout.autoPadding = true;
			delete chartConfig.scales.x.max;
			delete chartConfig.scales.y.max;
		}
	};

	// handle if axis values are same
	const handleEqualAxis = (xAxis, data) => {
		if (xAxis === 'razi' && raziList !== '') {
			let raziData;
			if (raziList.split(',').length > 1) {
				raziData = data
					.flat()
					.filter((el) => el[0]._resultadofinal)
					.flat()
					.map((el, i) => {
						return {
							x: el._resultadofinal,
							y: el._resultadofinal,
							label: candidates.find((elm) => elm.can_id === el._idCandidato).index,
							r: bubbleRadius,
							name: candidates.find((elm) => elm.can_id === el._idCandidato)
						};
					});
			} else {
				raziData = data
					.flat()
					.filter((el) => el._resultadofinal)
					.map((el, i) => {
						return {
							x: el._resultadofinal,
							y: el._resultadofinal,
							label: i + 1,
							r: bubbleRadius,
							name: candidates.find((elm) => elm.can_id === el._idCandidato)
						};
					});
			}

			handleAxis(raziData);

			flushSync(() => {
				setPosition(raziData);
			});
			setPrint(true);
			chartRef.current.update();
		} else if (xAxis === 'performance' && performanceList !== '') {
			let performance, array;
			if (performanceList.split(',').length > 1) {
				performance = data
					.flat()
					.flat()
					.filter((el) => el.porcentaje)
					.filter((el, i, array) => array.findIndex((elm) => elm.porcentaje === el.porcentaje) === i);
				array = performance.map((el, i, array) => {
					let name = data
						.flat()
						.flat()
						.filter((el) => el._NombreCandidato);

					return {
						x: el.porcentaje,
						y: el.porcentaje,
						name: candidates.find((elm) => name[i]._NombreCandidato.includes(elm.can_nombre)),
						label: candidates.find((elm) => name[i]._NombreCandidato.includes(elm.can_nombre)).index,
						r: bubbleRadius
					};
				});
			} else {
				performance = data.flat().find((el) => el.porcentaje).porcentaje;
				let selected = candidates.find((el) => el.can_id === +performanceList);
				array = [{ x: performance, y: performance, label: 1, name: selected, r: bubbleRadius }];
			}

			handleAxis(array);

			flushSync(() => {
				setPosition(array);
			});
		} else if (xAxis === 'apl' && aplList !== '') {
			let aplData;
			if (aplList.split(',').length > 1) {
				aplData = data
					.flat()
					.flat()
					.filter((el) => el.calceranking)
					.map((el, i) => {
						let name = data
							.flat()
							.flat()
							.filter((el) => el._idCandidato)
							.map((el) => el);
						return {
							x: el.calceranking,
							y: el.calceranking,
							label: candidates.find((elm) => elm.can_id === name[i]._idCandidato).index,
							r: bubbleRadius,
							name: candidates.find((el) => el.can_id === name[i]._idCandidato)
						};
					});
			} else {
				aplData = data
					.flat()
					.filter((el) => el.calceranking)
					.map((el, i) => {
						return {
							x: el.calceranking,
							y: el.calceranking,
							label: 1,
							r: bubbleRadius,
							name: candidates.find((elm) => {
								return elm.can_id === data.flat().find((el) => el._idCandidato)._idCandidato;
							})
						};
					});
			}

			handleAxis(aplData);

			flushSync(() => {
				setPosition(aplData);
			});

			setPrint(true);
			chartRef.current.update();
		} else {
			setPosition([]);
			setPrint(false);
			setSnackbar({ ...isSnackbar, open: true });
		}
		setGenerated((prev) => !prev);
	};

	// handle position
	const handlePositionData = (data, xAxis, yAxis) => {
		let positionX, positionY;

		if (
			(xAxis === 'apl&razi' || yAxis === 'apl&razi') &&
			(yAxis === 'apl' || xAxis === 'apl') &&
			raziList !== '' &&
			aplList !== ''
		) {
			let array;
			let aplRaziIndex = xAxis === 'apl&razi' ? 0 : 1;
			positionX = data[1]
				.flat()
				.flat()
				.filter((el) => el._resultadofinal);

			if (aplList.split(',').length > 1) {
				positionY = data[0].map((el, i, array) => {
					return {
						_idCandidato: array[i]
							.flat()
							.flat()
							.find((el) => el._idCandidato)._idCandidato,
						calceranking: array[i]
							.flat()
							.flat()
							.find((el) => el.calceranking).calceranking
					};
				});

				if (aplRaziIndex === 0) {
					array = positionY.map((el, i) => {
						let raziValue = positionX.find((elm) => elm._idCandidato === el._idCandidato)._resultadofinal;
						let aplAndRazi = el.calceranking * (value.aplWeight / 100) + raziValue * (value.raziWeight / 100);
						return {
							x: aplAndRazi,
							y: el.calceranking,
							label: candidates.find((elm) => elm.can_id === el._idCandidato).index,
							r: bubbleRadius,
							name: candidates.find((elm) => elm.can_id === el._idCandidato)
						};
					});
				} else {
					array = positionY.map((el, i) => {
						let raziValue = positionX.find((elm) => elm._idCandidato === el._idCandidato)._resultadofinal;
						let aplAndRazi = el.calceranking * (value.aplWeight / 100) + raziValue * (value.raziWeight / 100);

						return {
							x: el.calceranking,
							y: aplAndRazi,
							label: candidates.find((elm) => elm.can_id === el._idCandidato).index,
							r: bubbleRadius,
							name: candidates.find((elm) => elm.can_id === el._idCandidato)
						};
					});
				}
			} else {
				positionY = data[0]
					.flat()
					.flat()
					.filter((el) => el.calceranking || el._idCandidato)
					.map((el, i, array) => {
						return {
							_idCandidato: array.find((el) => el._idCandidato)._idCandidato,
							calceranking: array.find((el) => el.calceranking).calceranking
						};
					});

				if (aplRaziIndex === 0) {
					array = positionY.map((el, i) => {
						let raziValue = positionX.find((elm) => elm._idCandidato === el._idCandidato)._resultadofinal;
						let razi = el.calceranking * (value.aplWeight / 100) + raziValue * (value.raziWeight / 100);
						return {
							x: razi,
							y: el.calceranking,
							label: candidates.find((elm) => elm.can_id === el._idCandidato).index,
							r: bubbleRadius,
							name: candidates.find((elm) => elm.can_id === el._idCandidato)
						};
					});

					array = array.filter((el, i, array) => array.findIndex((elm) => elm.label === el.label) === i);
				} else {
					array = positionY.map((el, i) => {
						let raziValue = positionX.find((elm) => elm._idCandidato === el._idCandidato)._resultadofinal;
						let razi = el.calceranking * (value.aplWeight / 100) + raziValue * (value.raziWeight / 100);

						return {
							x: el.calceranking,
							y: razi,
							label: candidates.find((elm) => elm.can_id === el._idCandidato).index,
							r: bubbleRadius,
							name: candidates.find((elm) => elm.can_id === el._idCandidato)
						};
					});

					array = array.filter((el, i, array) => array.findIndex((elm) => elm.label === el.label) === i);
				}
			}

			handleAxis(array);

			flushSync(() => {
				setPosition(array);
			});

			setPrint(true);
		} else if (
			(xAxis === 'apl&razi' || yAxis === 'apl&razi') &&
			(yAxis === 'razi' || xAxis === 'razi') &&
			raziList !== '' &&
			aplList !== ''
		) {
			let array;
			let aplRaziIndex = xAxis === 'apl&razi' ? 0 : 1;

			positionX = data[1]
				.flat()
				.flat()
				.filter((el) => el._resultadofinal);

			if (raziList.split(',').length > 1) {
				positionY = data[0].map((el, i, array) => {
					return {
						_idCandidato: array[i]
							.flat()
							.flat()
							.find((el) => el._idCandidato)._idCandidato,
						calceranking: array[i]
							.flat()
							.flat()
							.find((el) => el.calceranking).calceranking
					};
				});

				array =
					aplRaziIndex === 1
						? positionX.map((el, i) => {
								let aplValue = positionY.find((elm) => elm._idCandidato === el._idCandidato).calceranking;
								let aplAndRazi = aplValue * (value.aplWeight / 100) + el._resultadofinal * (value.raziWeight / 100);
								return {
									x: el._resultadofinal,
									y: aplAndRazi,
									label: candidates.find((elm) => elm.can_id === el._idCandidato).index,
									r: bubbleRadius,
									name: candidates.find((elm) => elm.can_id === el._idCandidato)
								};
						  })
						: positionX.map((el, i) => {
								let aplValue = positionY.find((elm) => elm._idCandidato === el._idCandidato).calceranking;
								let aplAndRazi = aplValue * (value.aplWeight / 100) + el._resultadofinal * (value.raziWeight / 100);
								return {
									x: aplAndRazi,
									y: el._resultadofinal,
									label: candidates.find((elm) => elm.can_id === el._idCandidato).index,
									r: bubbleRadius,
									name: candidates.find((elm) => elm.can_id === el._idCandidato)
								};
						  });
			} else {
				positionY = data[0]
					.flat()
					.flat()
					.filter((el) => el.calceranking || el._idCandidato)
					.map((el, i, array) => {
						return {
							_idCandidato: array.find((el) => el._idCandidato)._idCandidato,
							calceranking: array.find((el) => el.calceranking).calceranking
						};
					});

				array =
					aplRaziIndex === 1
						? positionX.map((el, i) => {
								let aplValue = positionY.find((elm) => elm._idCandidato === el._idCandidato).calceranking;
								let apl = aplValue * (value.aplWeight / 100) + el._resultadofinal * (value.raziWeight / 100);
								return {
									x: el._resultadofinal,
									y: apl,
									label: candidates.find((elm) => elm.can_id === el._idCandidato).index,
									r: bubbleRadius,
									name: candidates.find((elm) => elm.can_id === el._idCandidato)
								};
						  })
						: positionX.map((el, i) => {
								let aplValue = positionY.find((elm) => elm._idCandidato === el._idCandidato).calceranking;
								let apl = aplValue * (value.aplWeight / 100) + el._resultadofinal * (value.raziWeight / 100);
								return {
									x: apl,
									y: el._resultadofinal,
									label: candidates.find((elm) => elm.can_id === el._idCandidato).index,
									r: bubbleRadius,
									name: candidates.find((elm) => elm.can_id === el._idCandidato)
								};
						  });
			}

			handleAxis(array);

			flushSync(() => {
				setPosition(array);
			});

			setPrint(true);
		} else if (
			(xAxis === 'apl' || xAxis === 'razi') &&
			(yAxis === 'razi' || yAxis === 'apl') &&
			raziList !== '' &&
			aplList !== ''
		) {
			let aplPosition = xAxis === 'apl' ? 0 : 1;
			let raziPosition = xAxis === 'razi' ? 0 : 1;
			positionY = data[raziPosition]
				.flat()
				.flat()
				.filter((el) => el._resultadofinal);

			if (aplList.split(',').length > 1) {
				positionX = data[aplPosition].map((el, i, array) => {
					return {
						_idCandidato: array[i]
							.flat()
							.flat()
							.find((el) => el._idCandidato)._idCandidato,
						calceranking: array[i]
							.flat()
							.flat()
							.find((el) => el.calceranking).calceranking
					};
				});
			} else {
				positionX = data[aplPosition]
					.flat()
					.flat()
					.filter((el) => el.calceranking || el._idCandidato)
					.map((el, i, array) => {
						return {
							_idCandidato: array.find((el) => el._idCandidato)._idCandidato,
							calceranking: array.find((el) => el.calceranking).calceranking
						};
					});
			}

			let array =
				aplPosition === 0
					? positionY.map((el, i, array) => {
							return {
								x: positionX.find((elm) => elm._idCandidato === el._idCandidato).calceranking,
								y: el._resultadofinal,
								label: candidates.find((elm) => elm.can_id === el._idCandidato).index,
								r: bubbleRadius,
								name: candidates.find((elm) => elm.can_id === el._idCandidato)
							};
					  })
					: positionY.map((el, i) => {
							return {
								x: el._resultadofinal,
								y: positionX.find((elm) => elm._idCandidato === el._idCandidato).calceranking,
								label: candidates.find((elm) => elm.can_id === el._idCandidato).index,
								r: bubbleRadius,
								name: candidates.find((elm) => elm.can_id === el._idCandidato)
							};
					  });

			handleAxis(array);

			flushSync(() => {
				setPosition(array);
			});
			setPrint(true);
		} else if (
			(xAxis === 'razi' || xAxis === 'performance') &&
			(yAxis === 'performance' || yAxis === 'razi') &&
			raziList !== '' &&
			performanceList !== ''
		) {
			let raziPosition = xAxis === 'razi' ? 0 : 1;
			let performancePosition = xAxis === 'performance' ? 0 : 1;
			positionX = data[raziPosition]
				.flat()
				.flat()
				.filter((el) => el._resultadofinal);

			if (performanceList.split(',').length > 1) {
				positionY = data[performancePosition]
					.flat()
					.flat()
					.filter((el) => el.porcentaje)
					.filter((el, i, array) => array.findIndex((elm) => elm.porcentaje === el.porcentaje) === i);
			} else {
				positionY = data[performancePosition]
					.flat()
					.filter((el) => el.porcentaje)
					.filter((elm, i, arr) => arr.findIndex((el) => el.porcentaje === elm.porcentaje) === i);
			}

			let array =
				raziPosition === 0
					? positionX.map((el, i) => {
							return {
								x: el._resultadofinal,
								y: positionY[i].porcentaje,
								label: candidates.find((elm) => elm.can_id === el._idCandidato).index,
								r: bubbleRadius,
								name: candidates.find((elm) => elm.can_id === el._idCandidato)
							};
					  })
					: positionX.map((el, i) => {
							return {
								x: positionY[i].porcentaje,
								y: el._resultadofinal,
								label: candidates.find((elm) => elm.can_id === el._idCandidato).index,
								r: bubbleRadius,
								name: candidates.find((elm) => elm.can_id === el._idCandidato)
							};
					  });

			handleAxis(array);

			flushSync(() => {
				setPosition(array);
			});

			setPrint(true);
		} else if ((xAxis === 'apl' || xAxis === 'performance') && (yAxis === 'performance' || yAxis === 'apl')) {
			let aplPosition = xAxis === 'apl' ? 0 : 1;
			let performancePosition = xAxis === 'performance' ? 0 : 1;

			if (performanceList.split(',').length > 1) {
				positionY = data[performancePosition]
					.flat()
					.flat()
					.filter((el) => el.porcentaje)
					.filter((el, i, array) => array.findIndex((elm) => elm.porcentaje === el.porcentaje) === i);
			} else {
				positionY = data[performancePosition]
					.flat()
					.filter((el) => el.porcentaje)
					.filter((elm, i, arr) => arr.findIndex((el) => el.porcentaje === elm.porcentaje) === i);
			}

			if (aplList.split(',').length > 1) {
				positionX = data[aplPosition].map((el, i, array) => {
					return {
						_idCandidato: array[i]
							.flat()
							.flat()
							.find((el) => el._idCandidato)._idCandidato,
						calceranking: array[i]
							.flat()
							.flat()
							.find((el) => el.calceranking).calceranking
					};
				});
			} else {
				positionX = data[aplPosition]
					.flat()
					.flat()
					.filter((el) => el.calceranking || el._idCandidato)
					.map((el, i, array) => {
						return {
							_idCandidato: array.find((el) => el._idCandidato)._idCandidato,
							calceranking: array.find((el) => el.calceranking).calceranking
						};
					});

				positionX = positionX.filter(
					(elm, i, arr) => arr.findIndex((el) => el._idCandidato === elm._idCandidato) === i
				);
			}

			let array =
				aplPosition === 0
					? positionX.map((el, i) => {
							return {
								x: el.calceranking,
								y: positionY[i].porcentaje,
								label: candidates.find((elm) => elm.can_id === el._idCandidato).index,
								r: bubbleRadius,
								name: candidates.find((elm) => elm.can_id === el._idCandidato)
							};
					  })
					: positionX.map((el, i) => {
							return {
								x: positionY[i].porcentaje,
								y: el.calceranking,
								label: candidates.find((elm) => elm.can_id === el._idCandidato).index,
								r: bubbleRadius,
								name: candidates.find((elm) => elm.can_id === el._idCandidato)
							};
					  });

			handleAxis(array);

			console.log(array);

			flushSync(() => {
				setPosition(array);
			});

			setPrint(true);
		} else {
			setPosition([]);
			setPrint(false);
			setSnackbar({ ...isSnackbar, open: true });
		}
		chartRef.current.update();
		setGenerated((prev) => !prev);
	};

	// handle if axis values are different
	const handleNotEqualAxis = async (xAxis, yAxis) => {
		const xId =
			xAxis === 'apl'
				? aplList
				: xAxis === 'performance'
				? performanceList
				: xAxis === 'razi'
				? raziList
				: xAxis === 'apl&razi'
				? aplList
				: '';
		const yId =
			yAxis === 'apl'
				? aplList
				: yAxis === 'performance'
				? performanceList
				: yAxis === 'razi'
				? raziList
				: yAxis === 'apl&razi'
				? aplList
				: '';
		let xPosition, yPosition;
		try {
			// check if test include the apl+razi
			if (xId !== '' && yId !== '') {
				if (
					(xAxis === 'apl&razi' && (yAxis === 'razi' || yAxis === 'apl' || yAxis === 'performance')) ||
					(yAxis === 'apl&razi' && (xAxis === 'razi' || xAxis === 'apl' || xAxis === 'performance'))
				) {
					xPosition = await fetch('/get/apl?id=' + xId).then((response) => response.json());
					yPosition = await fetch('/get/razi?id=' + yId).then((response) => response.json());
				} else {
					// if another test selected
					xPosition = await fetch('/get/' + xAxis + '?id=' + xId).then((response) => response.json());
					yPosition = await fetch('/get/' + yAxis + '?id=' + yId).then((response) => response.json());
				}
			} else {
				setPrint(false);
				setPosition([]);
				setSnackbar({ ...isSnackbar, open: true });
			}
		} catch (e) {
			setPrint(false);
			setPosition([]);
			setSnackbar({ ...isSnackbar, open: true });
		}

		xId &&
			yId !== '' &&
			Promise.all([xPosition, yPosition])
				.then((data) => {
					handlePositionData(data, xAxis, yAxis);
				})
				.catch((e) => {
					setPrint(false);
					setPosition([]);
				});
	};

	// handle apl and razi
	const handleAplAndRazi = (data) => {
		data
			.then((response) => {
				let razi, apl, array;
				if (aplList !== '' && raziList !== '') {
					if (aplList.split(',').length > 1) {
						razi = response[1]
							.flat()
							.flat()
							.filter((el) => el._resultadofinal);

						apl = response[0].map((el, i, array) => {
							return {
								_idCandidato: array[i]
									.flat()
									.flat()
									.find((el) => el._idCandidato)._idCandidato,
								calceranking: array[i]
									.flat()
									.flat()
									.find((el) => el.calceranking).calceranking
							};
						});

						array = razi.map((el, i) => {
							let aplValue = apl.find((elm) => elm._idCandidato === el._idCandidato).calceranking;
							let axis = aplValue * (value.aplWeight / 100) + el._resultadofinal * (value.raziWeight / 100);
							return {
								x: axis,
								y: axis,
								label: candidates.find((elm) => elm.can_id === el._idCandidato).index,
								r: bubbleRadius,
								name: candidates.find((elm) => elm.can_id === el._idCandidato)
							};
						});
					} else {
						razi = response[1].flat().filter((el) => el._resultadofinal);
						apl = response[0].flat().filter((el) => el.calceranking);
						let obj = [{ ...apl[0], ...razi[0] }];
						array = obj.map((el, i) => {
							let axis = el.calceranking * (value.aplWeight / 100) + el._resultadofinal * (value.raziWeight / 100);
							return {
								x: axis,
								y: axis,
								label: candidates.find((elm) => elm.can_id === el._idCandidato).index,
								r: bubbleRadius,
								name: candidates.find(
									(elm) => elm.can_id === response[1].flat().find((el) => el._idCandidato)._idCandidato
								)
							};
						});
					}

					handleAxis(array);

					flushSync(() => {
						setPosition(array);
					});
					setPrint(true);
					setGenerated((prev) => !prev);
					chartRef.current.update();
				} else {
					setPosition([]);
					setPrint(false);
					setSnackbar({ ...isSnackbar, open: true });
				}
			})
			.catch((e) => {
				setPrint(false);
				setPosition([]);
			});
	};

	// handle position
	const handlePosition = async (xAxis, yAxis) => {
		const id =
			xAxis === 'apl'
				? aplList
				: xAxis === 'performance'
				? performanceList
				: xAxis === 'razi'
				? raziList
				: xAxis === 'apl&razi'
				? aplList
				: '';
		const url = '/get/' + xAxis + '?id=' + id;

		if (id !== '') {
			// if same position
			if (xAxis === yAxis) {
				if (xAxis === 'apl' && (value.profile === '' || value.aplNorm === '')) {
					handleErrors();
				} else if (xAxis === 'apl&razi' && (value.profile === '' || value.aplNorm === '')) {
					handleAplRaziErrors();
				} else if (xAxis === 'apl&razi') {
					let apl = await fetch('/get/apl?id=' + id).then((response) => response.json());
					let razi = await fetch('/get/razi?id=' + id).then((response) => response.json());
					let performance = await fetch('/get/performance?id=' + id).then((response) => response.json());
					Promise.all([apl, razi, performance]);
					handleAplAndRazi(Promise.all([apl, razi, performance]));
				} else {
					try {
						setValid({ ...isValid, aplNorm: false });
						id !== '' &&
							(await fetch(url)
								.then((response) => response.json())
								.then((data) => {
									handleEqualAxis(xAxis, data);
								}));
					} catch (e) {
						console.log(e);
						setPrint(false);
					}
				}
			} else if (
				(xAxis === 'apl' || yAxis === 'apl') &&
				(xAxis === 'razi' || yAxis === 'razi') &&
				(value.profile === '' || value.aplNorm === '')
			) {
				handleAplRaziErrors();
			} else if (
				(xAxis === 'apl' || yAxis === 'apl') &&
				(xAxis === 'apl&razi' || yAxis === 'apl&razi') &&
				(value.profile === '' || value.aplNorm === '')
			) {
				handleAplRaziErrors();
			} else if (
				(xAxis === 'razi' || yAxis === 'razi') &&
				(xAxis === 'apl&razi' || yAxis === 'apl&razi') &&
				(value.profile === '' || value.aplNorm === '')
			) {
				handleAplRaziErrors();
			} else if (
				(xAxis === 'apl' || yAxis === 'apl') &&
				(xAxis === 'performance' || yAxis === 'performance') &&
				(value.profile === '' || value.aplNorm === '')
			) {
				handleErrors();
			} else if (
				(xAxis === 'apl&razi' || yAxis === 'apl&razi') &&
				(xAxis === 'performance' || yAxis === 'performance') &&
				(value.profile === '' || value.aplNorm === '')
			) {
				handleAplRaziErrors();
			} else {
				setValid({ ...isValid, aplNorm: false, profile: false });
				await handleNotEqualAxis(xAxis, yAxis);
			}
		} else {
			setPosition([]);
			setPrint(false);
			setSnackbar({ ...isSnackbar, open: true });
		}
	};

	// handle errors
	const handleErrors = () => {
		if (value.profile === '' && value.aplNorm === '') {
			setValid((isValid) => {
				return { ...isValid, profile: true, aplNorm: true };
			});
		} else if (value.profile === '') {
			setValid({ ...isValid, profile: true });
		} else if (value.aplNorm === '') {
			setValid({ ...isValid, aplNorm: true });
		}
	};

	const handleAplRaziErrors = () => {
		if (value.profile === '' && value.aplNorm === '') {
			setValid({ ...isValid, aplNorm: true, profile: true });
		} else if (value.profile === '' && value.aplNorm === '') {
			setValid({ ...isValid, aplNorm: true, profile: true });
		} else if (value.profile === '') {
			setValid({ ...isValid, profile: true });
		} else if (value.aplNorm === '') {
			setValid({ ...isValid, aplNorm: true });
		}
	};

	// get position
	const getPosition = async (xAxis, yAxis) => {
		const isHorizontalTotal = horizontalTotal !== 100;
		const isVerticalTotal = verticalTotal !== 100;
		if (isHorizontalTotal) {
			setValid({ ...isValid, horizontalChartError: true });
		} else if (isVerticalTotal) {
			setValid({ ...isValid, verticalChartError: true });
		} else {
			setValid({ ...isValid, horizontalChartError: false, verticalChartError: false });
			await handlePosition(xAxis, yAxis);
		}
	};

	// on change input
	const handleChange = (e) =>
		setValue((prev) => {
			let value = e.target.value;
			value = value.slice(0, 3);
			// Convert the value to a number
			const numberValue = Number(value);
			// Restrict the maximum value to 100
			if (!isNaN(numberValue) && numberValue >= 100) {
				value = '100';
				return { ...prev, [e.target.name]: value };
			} else if (!isNaN(numberValue) && numberValue < 0) {
				value = '0';
				return { ...prev, [e.target.name]: value };
			} else {
				return { ...prev, [e.target.name]: e.target.value };
			}
		});
	// #end region

	return (
		<>
			{/* filter section */}
			<Box
				component={'section'}
				sx={{
					'@media print and (min-width: 320px)': {
						printColorAdjust: 'exact',
						WebkitPrintColorAdjust: 'exact'
					}
				}}
			>
				<Container
					maxWidth="xxl"
					sx={{
						py: 3
					}}
				>
					{/* grid */}
					<Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3, lg: 5 }}>
						<Grid item xs={12} displayPrint={'none'}>
							<Typography variant="h4" fontWeight={600} marginBottom={3}>
								Test Selection
							</Typography>
						</Grid>
						<Grid item xs={12} md={3} sm={6} displayPrint={'none'}>
							<FormControl fullWidth>
								<Box id="xAxisLabel" fontWeight={600} textTransform="capitalize">
									X Axis
								</Box>
								<Select
									labelId="xAxisLabel"
									id="xAxis"
									value={value.xAxis}
									name="xAxis"
									onChange={(e) => handleChange(e)}
									sx={{ textTransform: 'capitalize' }}
									displayEmpty
								>
									{axis.map((el) => (
										<MenuItem key={el.id} value={el.value} sx={{ textTransform: 'capitalize' }}>
											{el.axis}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={12} md={3} sm={6} displayPrint={'none'}>
							<FormControl fullWidth>
								<Box id="yAxisLabel" fontWeight={600} textTransform="capitalize">
									Y Axis
								</Box>
								<Select
									labelId="yAxisLabel"
									id="yAxis"
									value={value.yAxis}
									name="yAxis"
									sx={{ textTransform: 'capitalize' }}
									onChange={(e) => handleChange(e)}
									displayEmpty
								>
									{axis.map((el) => (
										<MenuItem key={el.id} value={el.value} sx={{ textTransform: 'capitalize' }}>
											{el.axis}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={12} md={3} sm={6} displayPrint={'none'}>
							<FormControl fullWidth>
								<Box id="profileLabel" fontWeight={600} textTransform="capitalize">
									Profile
								</Box>
								<Select
									labelId="profileLabel"
									id="profile"
									value={value.profile}
									name="profile"
									onChange={(e) => handleChange(e)}
									displayEmpty
									error={isValid.profile}
								>
									<MenuItem value="">None</MenuItem>
									{routeData[0][0].response.map((el) => (
										<MenuItem key={el.pl_id} value={el.nombreNivelOrg}>
											{el.nombreNivelOrg}
										</MenuItem>
									))}
								</Select>
								<FormHelperText error sx={{ visibility: isValid.profile ? 'visible' : 'hidden' }}>
									The profile is a required field with the APL test.
								</FormHelperText>
							</FormControl>
						</Grid>
						<Grid item xs={12} md={3} sm={6} displayPrint={'none'}>
							<FormControl fullWidth>
								<Box id="normLabel" fontWeight={600} textTransform="capitalize">
									apl norm
								</Box>
								<Select
									labelId="normLabel"
									id="aplNorm"
									value={value.aplNorm}
									name="aplNorm"
									onChange={(e) => handleChange(e)}
									displayEmpty
									error={isValid.aplNorm}
								>
									<MenuItem value="">None</MenuItem>
									{routeData[1][0].response[0].map((el) => (
										<MenuItem key={el.na_id} value={el.na_nombre}>
											{el.na_nombre}
										</MenuItem>
									))}
									{routeData[1][0].response[1].map((el) => (
										<MenuItem key={el.nt_id} value={el.nt_Nombre}>
											{el.nt_Nombre}
										</MenuItem>
									))}
								</Select>
								<FormHelperText error sx={{ visibility: isValid.aplNorm ? 'visible' : 'hidden' }}>
									Apl Norm is required field.
								</FormHelperText>
							</FormControl>
						</Grid>
						<Grid item xs={12} md={3} sm={6} displayPrint={'none'}>
							<FormControl fullWidth>
								<Box id="normLabel" fontWeight={600} textTransform="capitalize">
									razi norm
								</Box>
								<Select
									labelId="normLabel"
									id="raziNorm"
									value={value.raziNorm}
									name="raziNorm"
									onChange={(e) => handleChange(e)}
									displayEmpty
								>
									<MenuItem value="">None</MenuItem>
									{routeData[2][0].response[0].map((el) => (
										<MenuItem key={el.na_id} value={el.na_nombre}>
											{el.na_nombre}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						{(value.xAxis === 'apl&razi' || value.yAxis === 'apl&razi') && (
							<>
								<Grid item xs={12} marginTop={2} marginBottom={2} displayPrint={'none'}>
									<Alert variant="outlined" severity={'info'}>
										You selected the APL + Razi option. Please enter the apl and razi weight and make sure that the
										total weight of Apl and razi is not greater than 100. <br />
										The current total weight is{' '}
										<Box component={'span'} fontWeight={600}>
											{Number(value.aplWeight) + Number(value.raziWeight)}.
										</Box>
									</Alert>
								</Grid>
								<Grid item xs={12} md={3} sm={6} marginTop={2} marginBottom={2} displayPrint={'none'}>
									<FormControl fullWidth>
										<Box
											component={'label'}
											display={'block'}
											fontWeight={600}
											textTransform="capitalize"
											htmlFor="aplWeight"
										>
											Apl Weight
										</Box>
										<TextField
											id="aplWeight"
											inputProps={{ min: 0, max: 100, step: 5 }}
											type="number"
											name="aplWeight"
											value={value.aplWeight}
											onChange={(e) => handleChange(e)}
											error={Number(value.aplWeight) + Number(value.raziWeight) !== 100}
										/>
									</FormControl>
								</Grid>
								<Grid item xs={12} md={3} sm={6} marginTop={2} marginBottom={2} displayPrint={'none'}>
									<FormControl fullWidth>
										<Box
											component={'label'}
											display={'block'}
											fontWeight={600}
											textTransform="capitalize"
											htmlFor="raziWeight"
										>
											Razi Weight
										</Box>
										<TextField
											id="raziWeight"
											inputProps={{ min: 0, max: 100, step: 5 }}
											type="number"
											name="raziWeight"
											value={value.raziWeight}
											error={Number(value.aplWeight) + Number(value.raziWeight) !== 100}
											onChange={(e) => handleChange(e)}
										/>
									</FormControl>
								</Grid>
							</>
						)}
						<Grid item xs={12} displayPrint={'none'}>
							<Typography variant="h5" fontWeight={600}>
								Chart Settings
							</Typography>
						</Grid>
						<Grid item xs={12} md={4} sm={6} marginBottom={3} displayPrint={'none'}>
							<FormControl fullWidth>
								<Box component={'label'} fontWeight={600} textTransform="capitalize" display={'block'} htmlFor="xLow">
									Horizontal Low
								</Box>
								<TextField
									id="xLow"
									inputProps={{ min: 0, max: 100, step: 5 }}
									type="number"
									name="xLow"
									value={value.xLow}
									onChange={(e) => handleChange(e)}
								/>
							</FormControl>
						</Grid>
						<Grid item xs={12} md={4} sm={6} marginBottom={3} displayPrint={'none'}>
							<FormControl fullWidth>
								<Box
									component={'label'}
									fontWeight={600}
									textTransform="capitalize"
									display={'block'}
									htmlFor="xAverage"
								>
									Horizontal Average
								</Box>
								<TextField
									id="xAverage"
									type="number"
									name="xAverage"
									value={value.xAverage}
									inputProps={{ min: 0, max: 100, step: 5 }}
									onChange={(e) => handleChange(e)}
								/>
							</FormControl>
						</Grid>
						<Grid item xs={12} md={4} sm={6} marginBottom={3} displayPrint={'none'}>
							<FormControl fullWidth>
								<Box component={'label'} display={'block'} fontWeight={600} textTransform="capitalize" htmlFor="xHigh">
									Horizontal High
								</Box>
								<TextField
									id="xHigh"
									inputProps={{ min: 0, max: 100, step: 5 }}
									type="number"
									name="xHigh"
									value={value.xHigh}
									onChange={(e) => handleChange(e)}
								/>
							</FormControl>
						</Grid>
						<Grid item xs={12} md={4} sm={6} marginBottom={3} displayPrint={'none'}>
							<FormControl fullWidth>
								<Box component={'label'} fontWeight={600} textTransform="capitalize" display={'block'} htmlFor="yLow">
									Vertical Low
								</Box>
								<TextField
									id="yLow"
									inputProps={{ min: 0, max: 100, step: 5 }}
									type="number"
									name="yLow"
									value={value.yLow}
									onChange={(e) => handleChange(e)}
								/>
							</FormControl>
						</Grid>
						<Grid item xs={12} md={4} sm={6} marginBottom={3} displayPrint={'none'}>
							<FormControl fullWidth>
								<Box
									component={'label'}
									fontWeight={600}
									textTransform="capitalize"
									display={'block'}
									htmlFor="yAverage"
								>
									Vertical Average
								</Box>
								<TextField
									id="yAverage"
									type="number"
									name="yAverage"
									value={value.yAverage}
									inputProps={{ min: 0, max: 100, step: 5 }}
									onChange={(e) => handleChange(e)}
								/>
							</FormControl>
						</Grid>
						<Grid item xs={12} md={4} sm={6} marginBottom={3} displayPrint={'none'}>
							<FormControl fullWidth>
								<Box component={'label'} display={'block'} fontWeight={600} textTransform="capitalize" htmlFor="yHigh">
									Vertical High
								</Box>
								<TextField
									id="yHigh"
									inputProps={{ min: 0, max: 100, step: 5 }}
									type="number"
									name="yHigh"
									value={value.yHigh}
									onChange={(e) => handleChange(e)}
								/>
							</FormControl>
						</Grid>
						{(isValid.horizontalChartError || isValid.verticalChartError) && (
							<Grid item displayPrint={'none'} xs={12} sx={{ mt: 4 }}>
								<Alert
									variant="outlined"
									severity={horizontalTotal !== 100 || verticalTotal !== 100 ? 'warning' : 'success'}
								>
									The total of low, average, high should be equal to 100.
									<br />
									{!isNaN(horizontalTotal) ? (
										<>
											Current total for the horizontal axis is :-
											<Box component={'span'} fontWeight={'600'}>
												{horizontalTotal}
											</Box>
										</>
									) : (
										<>
											Horizontal axis :-{' '}
											<Box component={'span'} sx={{ color: (theme) => theme.palette.error.light }} fontWeight={'600'}>
												{' '}
												All fields should be filled.
											</Box>
										</>
									)}
									<br />
									{!isNaN(verticalTotal) ? (
										<>
											Current total for the vertical axis is :-
											<Box component={'span'} fontWeight={'600'}>
												{verticalTotal}
											</Box>
										</>
									) : (
										<>
											Vertical axis :-{' '}
											<Box component={'span'} sx={{ color: (theme) => theme.palette.error.light }} fontWeight={'600'}>
												{' '}
												All fields should be filled.
											</Box>
										</>
									)}
								</Alert>
							</Grid>
						)}
						<Grid item xs={12} displayPrint={'none'} textAlign="right" sx={{ my: 4 }}>
							<Button
								variant="contained"
								disabled={
									isValid.profile ||
									isValid.aplNorm ||
									((value.xAxis === 'apl&razi' || value.yAxis === 'apl&razi') &&
										Number(value.aplWeight) + Number(value.raziWeight) !== 100)
								}
								onClick={(e) => {
									getPosition(value.xAxis, value.yAxis);
									handleOmmited();
								}}
							>
								Generate
							</Button>
							{isPrint && !isValid.profile && !isValid.aplNorm && (
								<Button
									variant="contained"
									sx={{
										ml: 5,
										'@media print and (min-width: 320px)': {
											display: 'none'
										}
									}}
									onClick={() => {
										flushSync(() => {
											chartRef.current.resize();
										});
									}}
								>
									Print
								</Button>
							)}
						</Grid>
						<Grid item xs={12} lg={3} marginBottom={3} displayPrint="block">
							<FormControl fullWidth>
								<Box marginBottom={4} fontWeight={600} textTransform="capitalize" paddingTop={4}>
									Selected List
								</Box>
								<Table data={candidates} xOmmited={getXAxis} yOmmited={getYAxis} />
							</FormControl>
						</Grid>
						<Grid
							item
							lg={9}
							xs={12}
							sx={{
								mb: 10,
								mt: 4,
								flexGrow: 1,
								'@media print and (min-width: 320px)': {
									flexGrow: 0,
									breakInside: 'avoid'
								},
								'@media screen and (max-width: 576px)': {
									flexGrow: 0
								}
							}}
						>
							<Chart />
						</Grid>
					</Grid>
					<Snackbar
						anchorOrigin={{ vertical, horizontal }}
						open={open}
						autoHideDuration={4000}
						message="No matching results found!"
						onClose={() => setSnackbar({ ...isSnackbar, open: false })}
						key={vertical + horizontal}
					/>
					{/* grid */}
				</Container>
			</Box>
			{/* filter section */}
		</>
	);
}

export default TestSelection;
