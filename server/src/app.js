const http = require('http');
const fs = require('fs');
const url = require('url');
const fsPromises = require('fs').promises;

// server
const server = http.createServer(async function (req, res) {
	let parseUrl = url.parse(req.url, true);

	switch (true) {
		// get norma razi
		case parseUrl.pathname === '/get/normarazi' && req.method === 'GET':
			{
				fs.readFile(__dirname + '/db/SP_NormaRazi.json', 'utf8', function (err, data) {
					if (err) {
						console.log('File read failed:', err);
						res.writeHead(500, { 'Content-Type': 'application/json' });
						res.end(err);
						throw new Error('File read failed');
					}
					res.writeHead(200, { 'Content-Type': 'application/json' });
					res.end(data);
				});
			}

			break;

		// get normal Apl
		case parseUrl.pathname === '/get/normaapl' && req.method === 'GET': {
			return fs.readFile(__dirname + '/db/SP_GetNormaApl.json', 'utf8', function (err, data) {
				if (err) {
					console.log('File read failed:', err);
					res.writeHead(500, { 'Content-Type': 'application/json' });
					res.end(err);
					throw new Error('File read failed');
				}
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end(data);
			});
		}

		// get normal Apl
		case parseUrl.pathname === '/get/normaRazi' && req.method === 'GET': {
			return fs.readFile(__dirname + '/db/SP_NormaRazi.json', 'utf8', function (err, data) {
				if (err) {
					console.log('File read failed:', err);
					res.writeHead(500, { 'Content-Type': 'application/json' });
					res.end(err);
					throw new Error('File read failed');
				}
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end(data);
			});
		}

		//  get profiles
		case parseUrl.pathname === '/get/profiles' && req.method === 'GET': {
			return fs.readFile(__dirname + '/db/SP_GetProfile.json', 'utf8', function (err, data) {
				if (err) {
					console.log('File read failed:', err);
					res.writeHead(500, { 'Content-Type': 'application/json' });
					res.end(err);
					throw new Error('File read failed');
				}
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end(data);
			});
		}

		//  get internal candidate
		case parseUrl.pathname === '/get/candidates' && req.method === 'GET' && Object.keys(parseUrl.query).length === 0: {
			return fs.readFile(__dirname + '/db/SP_Manager_GetInternalCandidate-json.json', 'utf8', function (err, data) {
				if (err) {
					console.log('File read failed:', err);
					res.writeHead(500, { 'Content-Type': 'application/json' });
					res.end(err);
					throw new Error('File read failed');
				}
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end(data);
			});
		}

		//  get internal candidate with query string
		case parseUrl.pathname === '/get/candidates' && req.method === 'GET' && Object.keys(parseUrl.query).length !== 0:
			let array = parseUrl.query.id.split(',');
			{
				fs.readFile(__dirname + '/db/SP_Manager_GetInternalCandidate-json.json', 'utf8', async function (err, data) {
					if (err) {
						console.log('File read failed:', err);
						throw new Error('File read failed');
					}
					let candidates = await JSON.parse(data);
					res.end(
						JSON.stringify(
							candidates[0].response.data.colaboradores.filter((elm) => array.find((el) => el == elm.can_id))
						)
					);
				});
			}

			break;

		//  get internal candidate with query string
		case parseUrl.pathname === '/get/performance' && req.method === 'GET':
			{
				if (parseUrl.query.id === '') {
					res.end({ message: 'No record found!' });
				} else if (parseUrl.query.id !== '' && parseUrl.query.id.split(',').length === 1) {
					fs.readFile(
						__dirname +
							`/db/performance-candidate-result-json/SP_SP_Manager_ReportePerformance-${parseUrl.query.id}.json`,
						'utf8',
						function (err, data) {
							if (err) {
								console.log('File read failed:', err);
								throw new Error('File read failed');
							}
							res.writeHead(200, { 'Content-Type': 'application/json' });
							console.log(data);
							res.end(data);
						}
					);
				} else {
					console.log('tester');
					let arr = [];
					parseUrl.query.id.split(',').forEach((el, i, array) => {
						fs.promises
							.readFile(
								__dirname + `/db/performance-candidate-result-json/SP_SP_Manager_ReportePerformance-${el}.json`,
								'utf8'
							)
							.then(function (result) {
								arr.push(JSON.parse(result));
								if (arr.length === array.length) {
									res.end(JSON.stringify(arr));
								}
							})
							.catch(function (error) {
								console.log(error);
							});
					});
				}
			}

			break;

		case parseUrl.pathname === '/get/apl' && req.method === 'GET':
			{
				if (parseUrl.query.id.split(',').length === 1) {
					fs.readFile(
						__dirname + `/db/apl-candidate-result-json/SP_ReporteAPL-${parseUrl.query.id}.json`,
						'utf8',
						async function (err, data) {
							if (err) {
								console.log('File read failed:', err);
								throw new Error('File read failed');
							}
							res.writeHead(200, { 'Content-Type': 'application/json' });
							res.end(data);
						}
					);
				} else {
					let arr = [];
					parseUrl.query.id.split(',').forEach((el, i, array) => {
						fs.promises
							.readFile(__dirname + `/db/apl-candidate-result-json/SP_ReporteAPL-${el}.json`, 'utf8')
							.then(function (result) {
								arr.push(JSON.parse(result));
								if (arr.length === array.length) {
									res.end(JSON.stringify(arr));
								}
							})
							.catch(function (error) {
								console.log(error);
							});
					});
				}
			}

			break;

		case parseUrl.pathname === '/get/razi' && req.method === 'GET':
			{
				if (parseUrl.query.id.split(',').length === 1) {
					fs.readFile(
						__dirname + `/db/razi-candidate-result-json/SP_ReporteRazi-${parseUrl.query.id}.json`,
						'utf8',
						async function (err, data) {
							if (err) {
								console.log('File read failed:', err);
								throw new Error('File read failed');
							}
							res.writeHead(200, { 'Content-Type': 'application/json' });
							res.end(data);
						}
					);
				} else {
					let arr = [];
					parseUrl.query.id.split(',').forEach((el, i, array) => {
						fs.promises
							.readFile(__dirname + `/db/razi-candidate-result-json/SP_ReporteRazi-${el}.json`, 'utf8')
							.then(function (result) {
								arr.push(JSON.parse(result));
								if (arr.length === array.length) {
									res.end(JSON.stringify(arr));
								}
							})
							.catch(function (error) {
								console.log(error);
							});
					});
				}
			}

			break;

		case parseUrl.pathname === '/get/test' && req.method === 'GET':
			{
				if (parseUrl.query.id.split(',').length === 1) {
					fs.readFile(
						__dirname + `/db/ligarprueb-json/ligarprueba_${parseUrl.query.id}.json`,
						'utf8',
						async function (err, data) {
							if (err) {
								console.log('File read failed:', err);
								throw new Error('File read failed');
							}
							res.writeHead(200, { 'Content-Type': 'application/json' });
							res.end(data);
						}
					);
				} else {
					let arr = [];
					parseUrl.query.id.split(',').forEach((el, i, array) => {
						fs.promises
							.readFile(__dirname + `/db/ligarprueb-json/ligarprueba_${el}.json`, 'utf8')
							.then(function (result) {
								arr.push(JSON.parse(result));
								if (arr.length === array.length) {
									res.end(JSON.stringify(arr));
								}
							})
							.catch(function (error) {
								console.log(error);
							});
					});
				}
			}

			break;

		default:
			console.log(parseUrl.query, 'No matching url.');
	}
});

// listening
server.listen('9000', () => {
	console.log('Server is live on http://localhost:9000/get/candidates');
});
