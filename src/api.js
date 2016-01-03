import req from 'request-promise';

export default class {

	getAstroidDataForWeek(startDate) {
		let startDateStr = `${startDate.getFullYear()}-${startDate.getMonth()+1}-${startDate.getDate()}`;

		return req(`${window.location.origin}/astroids?start_date=${startDateStr}`)
			.then(d => JSON.parse(d));
	}

	getAsteroids(date) {
		let dateStr = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;

		return req(`${window.location.origin}/astroids?start_date=${dateStr}&end_date=${dateStr}`)
			.then(function (data) {
				var data = JSON.parse(data);
				var key = Object.keys(data.near_earth_objects)[0];
				return data.near_earth_objects[key];
			});
	}

	getAsteroid(neoId) {
		return req(`${window.location.origin}/asteroid/${neoId}`).then(d => JSON.parse(d));
	}
}