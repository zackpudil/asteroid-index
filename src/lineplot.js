import Raphael from 'node-g.raphael';
import AsteroidApi from './api';
import store from './store';

export default class {
	constructor(placeHolder) {
		this.api = new AsteroidApi();
		this.paper = Raphael(placeHolder);

		this.linePath = "M0,250";
		this.sp = [];
	}

	plotAsteroid(neoId) {
		this.api.getAsteroid(neoId)
			.then((data) => {
				this.paper.clear();

				let xValues = [],
					yValues = [],
					skippedData = [];

				for(let i = 0; i < data.close_approach_data.length; i += 5)
					skippedData.push(data.close_approach_data[i]);

				skippedData.forEach(x => {
					yValues.push(x.miss_distance.miles);
					xValues.push(Date.parse(x.close_approach_date));
				});

				let linechart = this.createLinechart(xValues, yValues, store.getColor(neoId));
				let datachart = this.createLinechart(xValues, yValues, 'black');

				this.initAnimation(linechart);
				this.configureAxisLabels(linechart,
					t => {
						let date = new Date(parseInt(t[0].textContent));
						t[0].textContent = date.getFullYear();
					},
					t => t[0].textContent = (parseInt(t[0].textContent)/1000000).toFixed(1).toLocaleString() + "m miles"
				);

				this.animate(linechart, datachart);

				datachart.remove();
			});
	}

	createLinechart(xValues, yValues, color) {
		let lc = this.paper.linechart(50, 50, 550, 250, xValues, yValues, { 
			smooth: true, 
			colors: [color],
			symbol: 'circle',
			axis: '0 0 1 1',
			axisxstep: 10,
			axisystep: 3
		});
		lc.attr("stroke", "#FFFFFF");
		return lc;
	}

	initAnimation(linechart) {
		linechart.lines.forEach(x => {
			let oldPath = x.attrs.path;
			x.attr("path", this.linePath)
			this.linePath = oldPath;
		});

		linechart.symbols[0].forEach((x, i) => { 
			let oldSp = { x: x.attrs.cx, y: x.attrs.cy };
			x.attr("cx", this.sp[i] ? this.sp[i].x : 0); 
			x.attr("cy", this.sp[i] ? this.sp[i].y : 250) 
			this.sp[i] ? this.sp[i] = oldSp : this.sp.push(oldSp);
		});
	}

	configureAxisLabels(linechart, configXFn, configYFn) {
		linechart.axis.forEach((a, i) => {
			a.text.forEach(t => {
				t.rotate(-45, t.attrs.x, t.attrs.y);
				t.attr("stroke", "#FFFFFF");
				i == 0 ? configXFn(t) : configYFn(t);
			});
		});
	}

	animate(linechart, datachart) {

		linechart.lines.forEach((x,i) => {
			x.animate({ path: datachart.lines[i].attr("path")}, 500);
		});

		linechart.symbols[0].forEach((s, i) => {
			let ds = datachart.symbols[0][i];
			s.animate({ cx: ds.attrs.cx, cy: ds.attrs.cy}, 500);
		});
	}
}