import Raphael from 'node-g.raphael';
import Api from './api';
import store from './store';

export default class AsteroidField {

	get canvas() {
		return {
			x: 1000,
			y: 300 
		};
	}

	get earth() {
		return {
			x: 50,
			y: this.canvas.y/2
		};
	}

	constructor(placeHolder, clickDelegate) {
		this.paper = Raphael(placeHolder, this.canvas.x, this.canvas.y);
		this.api = new Api();
		this.clickDelegate = clickDelegate;
		this.currentDate = null
	}

	startDrawAsteroids(date) {
		if(this.currentDate && this.currentDate.toLocaleDateString() == date.toLocaleDateString())
			return;

		this.currentDate = date;

		this.paper.clear();
		this.drawEarthAndBackground();
		this.api.getAsteroids(date)
			.then(this.drawAsteroids.bind(this));
	}

	drawEarthAndBackground() {
		this.paper
			.image("http://localhost:3000/images/earth.svg", this.earth.x-15, this.earth.y-15, 25, 25);

		this.paper
			.image("http://localhost:3000/images/jupitor.png", this.earth.x+300, this.earth.y-75, 150, 150);

		this.paper
			.circle(this.earth.x, this.earth.y, 75)
			.attr("stroke", "#FFFFFF");
	}

	drawAsteroids(data) {
		data.forEach(this.drawAsteroid.bind(this));
	}

	drawAsteroid(asteroid) {
		let distance = asteroid.close_approach_data[0].miss_distance.lunar*5;
		let radius = Math.max(asteroid.estimated_diameter.feet.estimated_diameter_max/500, 1);

		let y = store.getRandomY(asteroid.neo_reference_id, this.canvas.y-radius, radius);
		let x = this.earth.x + Math.sqrt(distance*distance + Math.pow(this.earth.y-y, 2));


		this.paper.circle(1000, this.earth.y, radius)
			.attr('fill', store.getColor(asteroid.neo_reference_id))
			.attr('stroke', '#FFFFFF')
			.hover(...this.setMarker(`${asteroid.name} : \n ${asteroid.estimated_diameter.feet.estimated_diameter_max.toFixed(1)} feet`, x, y, 0, radius + 2))
			.animate({ cx: x, cy: y }, Math.random()*500 + 500)
			.click(() => this.clickDelegate(asteroid.neo_reference_id, asteroid.name));
	}

	setMarker(name, x, y, a, r) {
		return [function() {
			this.marker = this.marker || 
				this.paper.tag(x, y, name, a, r)
					.attr("fill", "#FFFFFF")
					.attr("stroke", "black");

			this.marker.show();
		}, function () {
			this.marker && this.marker.hide();
		}]
	}
}