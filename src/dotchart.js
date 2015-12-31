import AsteroidApi from './api';
import Raphael from 'node-g.raphael';
import store from './store';

export default class {

	constructor(placeHolder, clickDelegate) {
		this.api = new AsteroidApi();
		this.r = Raphael(placeHolder);
		this.clickDelegate = clickDelegate;
	}

	drawDotmatrix() {
		this.api.getAstroidDataForWeek(new Date())
			.then(data => {
				this.delegateFirstAstroid(data.near_earth_objects[Object.keys(data.near_earth_objects)[0]][0]);

				let xaxis = this.createXAxis(data.near_earth_objects);
				let yaxis = this.createYAxis(data.near_earth_objects);
				let dotGraph = this.createDotGraph(data.near_earth_objects);

				let dotchart = this.createDotchart(xaxis, yaxis, dotGraph);

				dotchart.covers.forEach(x => {
					let info = dotGraph.names.find(y => y.value === x.value);
					x.dot.attr('fill', store.getColor(info.id));
				});

				var self = this;
				dotchart.hover(
					function () { self.dotchartHover(this, dotGraph); }, 
					function () { this.marker && this.marker.hide(); })

		        dotchart.click(function() { self.dotchartClick(this, dotGraph); });

			});
	}

	delegateFirstAstroid(firstAstroid) {
		let firstDate = new Date(firstAstroid.close_approach_data[0].close_approach_date);
		firstDate.setDate(firstDate.getDate() + 1);
		this.clickDelegate(firstDate, firstAstroid.neo_reference_id, firstAstroid.name);
	}

	createDotchart(xaxis, yaxis, dotGraph) {
		let dotchart = this.r.dotchart(0, 0, 520, 330, xaxis.xs, yaxis.ys, dotGraph.sizes, {
			max: 10,
			axis: "0 0 1 1",
			axisxtype: " ",
			axisytype: " ",
			axisxlabels: xaxis.xlabels
		});

		dotchart.axis.items.forEach(i => {
			i[1].forEach(t => {
				t.rotate(-45, t.attrs.x, t.attrs.y)
				t.attr("stroke", "#FFFFFF");
			})
		});

		dotchart.axis[1][0].text.forEach(t => {
			var num = parseInt(t[0].textContent);
			t[0].textContent = (num/1000000).toFixed(1).toLocaleString() + "m miles";
		});

		return dotchart;
	}

	dotchartHover(hoverContext, dotGraph) {
		let d = dotGraph.names.find(x => x.value == hoverContext.value);
        hoverContext.marker = hoverContext.marker || this.r
        	.tag(hoverContext.x, 
        		hoverContext.y, 
        		d.name + ": \n" + (d.value.toFixed(2)) + " feet", 
        		45, hoverContext.r + 2)
        	
            	.attr("fill", "#FFFFFF")
            	.attr("stroke", "black")
        	.insertBefore(hoverContext);

        hoverContext.marker.show();
	}

	dotchartClick(clickContext, dotGraph) {
		let info = dotGraph.names.find(x => x.value == clickContext.value);
    	let date = new Date(info.date);

    	date.setDate(date.getDate()+1);

    	this.clickDelegate(date, info.id, info.name);
	}

	createXAxis(neo) {
		let xs = [],
			xlabels = [];
		Object
			.keys(neo)
			.sort((a, b) => new Date(Date.parse(a)) - new Date(Date.parse(b)))
			.forEach(x => {
				neo[x].forEach(y => {
					var date = new Date(x);
					xlabels.push(`${date.getMonth()+1}-${date.getDate()}`);
					xs.push(Date.parse(x));
				});
			});
		return { xs: xs, xlabels: xlabels };
	}

	createYAxis(neo) {
		return {
			ys: this.mapAxis(y => y.close_approach_data[0].miss_distance.miles, neo)
		}
	}

	createDotGraph(neo) {
		return {
			sizes: this.mapAxis(y => y.estimated_diameter.feet.estimated_diameter_max, neo),
			names: this.mapAxis(y => {
				return {
					id: y.neo_reference_id,
					name: y.name, 
					value: y.estimated_diameter.feet.estimated_diameter_max, 
					distance: y.close_approach_data[0].miss_distance.miles,
					date: y.close_approach_data[0].close_approach_date 
				};
			}, neo)
		}
	}

	mapAxis(s, neo) {
		return Object
			.keys(neo)
			.sort((a, b) => new Date(Date.parse(a)) - new Date(Date.parse(b)))
			.map(x => {
				return neo[x].map(y => s(y));
			})
			.reduce((a, b) => a.concat(b));
	}
}