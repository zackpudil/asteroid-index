import Raphael from 'node-g.raphael';

window.asteroids = [];

export default class {

	static getColor(neoId) {
		let asteroid = window.asteroids.find(x => x.neo_reference_id == neoId);
		if(asteroid && asteroid.color)
			return asteroid.color;

		let color = Raphael.getColor();

		if(asteroid)
			asteroid.color = color;
		else
			window.asteroids.push({ neo_reference_id: neoId, color: color });

		return color;
	}

	static getRandomY(neoId, range, range2 = 0) {
		let asteroid = window.asteroids.find(x => x.neo_reference_id == neoId);
		if(asteroid && asteroid.y)
			return asteroid.y;

		let y = Math.floor(Math.random()*range) + range2;

		if(asteroid)
			asteroid.y = y;
		else
			window.asteroids.push({ neo_reference_id: neoId, y: y });

		return y;
	}
}