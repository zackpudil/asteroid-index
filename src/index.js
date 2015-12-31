import Field from './field';
import Dotchart from './dotchart';
import Lineplot from './lineplot';

window.onload = function () {
	var af = new Field("asteroidField", (neoId, name) => {
		document.getElementById('asteroid_name').innerHTML = name;
		al.plotAsteroid(neoId);
	});

	var al = new Lineplot("asteroidLineplot");
	var adm = new Dotchart("asteroidDotmatrix", (date, neoId, name) => {
		af.startDrawAsteroids(date);
		al.plotAsteroid(neoId);
		document.getElementById('asteroid_name').innerHTML = name;
	});

	adm.drawDotmatrix();
};