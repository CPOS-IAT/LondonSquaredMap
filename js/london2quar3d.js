//////////////////////////////////////////////////////////////////////////
//////////////////////// London2quar3d JavaScript ////////////////////////
//////////////////////////////////////////////////////////////////////////

// london2quar3d.js v1.0

var totals, months, measures, kpiSel, monthSel, dataSel, dataFiltered;
var q = queue();

///////////////////////////////////////////
/////////LOAD ALL DATA (START)/////////////
///////////////////////////////////////////

q.defer(d3.csv, "data/testData2.csv")
	.await(handleData)

///////////////////////////////////////////
/////////LOAD ALL DATA (END)///////////////
///////////////////////////////////////////

function handleData(error, dataIn) {
	if(error){alert("Data Error");}

  // determine unique months
  // months = d3.nest().key(function(d) { return d.month; }).entries(dataIn);

	// determine unique measures (kpis)
	measures = d3.nest().key(function(d) { return d.measure; }).entries(dataIn);

  // //build month list
	// var monthList = d3.select("#monthList")
	// 			.append("select")
	// 			.attr("multiple",true)
	// 			.attr("size",2)
	// 			.selectAll("option")
	// 			.data(d3.map(months, function(d) { return d.key;}).keys()).enter()
	// 			.append("option")
	// 			.text(function(d){return d;})
	// 			.attr("value", function(d){return d;});

	var measureList = d3.select("#kpiList")
				.append("select")
				.attr("id","kpis")
				//.attr("multiple",true)
				.attr("size",2)
				.selectAll("option")
				.data(d3.map(measures, function(d) { return d.key;}).keys()).enter()
				.append("option")
				.text(function(d){return d;})
				.attr("value", function(d){return d;});

	// set default kpi selection
	d3.select("#kpiList").property("selected", function(g) {
													kpiSel = measures[0].key;
													return g == kpiSel;
												});

	changeKPI(dataIn, kpiSel);

	d3.select("#kpis")
	.on("change", function() {
		kpiSel = this.value;
		changeKPI(dataIn, kpiSel);
	});
}

// change function - change data based on selected filter
function changeKPI(data, kpiSel){
	kpiSel = kpiSel;
	dataFiltered = data.filter(function(g) { return g.measure == kpiSel; });

	dataFiltered = d3.nest()
										.key(function(d) { return d.abbreviation; })
								.rollup(function(d) {
									return { total: d3.sum(d, function(g){ return g.value; }),
														borough: d[0].borough };
							})
							.entries(dataFiltered)
							.map(function(d) { return {abbreviation: d.key,
																					borough: d.values.borough,
																				total: d.values.total}; })
																				;

	mapSquared(dataFiltered, "#canvasDiv");
}

// Mapping Function - user must pass in the data table and the div
// where the map is to be located (preferably as an id)
function mapSquared(data, div){
	var width=700;
	var height=600;
	var clean = d3.select(div).selectAll("svg").remove();
	var canvas= d3.select(div).append("svg")
				.attr("width", width)
				.attr("height", height);

	// add colour gradient
	var gradient = canvas.append("defs")
												.append("radialGradient")
												.attr("cx","50%")
												.attr("cy","50%")
												.attr("r","75%")
												.attr("fx","50%")
												.attr("fy","50%")
												.attr("id","grad");
	var stop1 = gradient.append("stop")
											.attr("offset","0%")
											.attr("stop-color","red");
	var stop2 = gradient.append("stop")
											.attr("offset","100%")
											.attr("stop-color","#fff");

	var circles, grids, bar1, bar2, colorScale, radiusScale, barScale;

	var boroughGrids=[
		{borough:"Wst", path: "M0 409 c0 -314 2 -351 16 -345 8 3 57 -10 107 -30 125 -48 162 -45 313 32 101 51 121 57 188 62 l76 5 0 313 0 314 -350 0 -350 0 0 -351z", transformation: "translate(0,76) scale(0.10000000149011612,-0.10000000149011612)", height:0},
		{borough:"Cty", path: "M0 425 l0 -315 23 -9 c12 -5 94 -18 182 -30 369 -51 451 -63 473 -68 l22 -5 0 371 0 371 -350 0 -350 0 0 -315z", transformation: "translate(0,74) scale(0.10000000149011612,-0.10000000149011612)", height:0},
		{borough:"Tow", path: "M0 486 c0 -236 4 -367 10 -371 24 -15 121 26 173 73 66 60 107 78 149 66 45 -13 68 -50 80 -131 12 -84 33 -113 81 -113 54 0 61 11 68 101 7 98 24 119 95 119 l44 0 0 310 0 310 -350 0 -350 0 0 -364z", transformation: "translate(0,85) scale(0.10000000149011612,-0.10000000149011612)", height:0},
		{borough:"Nwm", path: "M0 430 l0 -330 42 -26 c134 -85 265 -90 450 -19 66 26 106 35 149 35 l59 0 0 335 0 335 -350 0 -350 0 0 -330z", transformation: "translate(0,76) scale(0.10000000149011612,-0.10000000149011612)", height:0},
		{borough:"Bar", path: "M0 377 c0 -243 3 -327 13 -339 21 -28 134 -38 415 -38 l272 0 0 350 0 350 -350 0 -350 0 0 -323z", transformation: "translate(0,70) scale(0.10000000149011612,-0.10000000149011612) ", height:0},
		{borough:"Lam", path: "M580 744 c-42 -15 -100 -41 -142 -66 -111 -64 -212 -72 -324 -25 -32 14 -70 27 -84 29 l-25 3 -3 -342 -2 -343 350 0 350 0 -2 373 -3 372 -50 2 c-27 1 -57 0 -65 -3z", transformation: "translate(0,76) scale(0.10000000149011612,-0.10000000149011612)", height:6},
		{borough:"Swr", path: "M0 371 l0 -371 350 0 350 0 0 313 c0 171 -4 317 -8 322 -4 6 -63 19 -132 28 -69 9 -136 19 -150 22 -14 2 -95 13 -180 24 -85 12 -172 23 -192 27 l-38 6 0 -371z", transformation: "translate(0,74) scale(0.10000000149011612,-0.10000000149011612)", height:4},
		{borough:"Lsh", path: "M290 802 c-8 -3 -41 -29 -72 -57 -59 -55 -125 -85 -185 -85 l-33 0 0 -330 0 -330 350 0 350 0 0 380 0 380 -24 12 c-44 19 -53 6 -58 -76 -3 -70 -6 -79 -36 -109 -29 -28 -39 -32 -88 -32 -51 0 -58 3 -89 36 -27 30 -35 48 -40 95 -11 99 -31 130 -75 116z", transformation: "translate(0,81) scale(0.10000000149011612,-0.10000000149011612)", height:11},
		{borough:"Grn", path: "M496 694 c-160 -62 -301 -64 -422 -4 -34 16 -64 30 -68 30 -3 0 -6 -162 -6 -360 l0 -360 350 0 350 0 0 365 0 365 -57 0 c-42 -1 -83 -11 -147 -36z", transformation: "translate(0,74) scale(0.10000000149011612,-0.10000000149011612)", height:4},
		{borough:"Bxl", path: "M0 356 l0 -356 350 0 350 0 0 350 0 350 -297 0 c-164 0 -322 3 -350 6 l-53 7 0 -357z", transformation: "translate(0,72) scale(0.10000000149011612,-0.10000000149011612)", height:2}]

	var gridCoordinates=[[0,1,2,3,"Enf",5,6,7],
							[0,1,"Hrw","Brn", "Hgy", "Wth", 6,7],
							["Hdn", "Elg", "Brt", "Cmd", "Isl", "Hck", "Rdb", "Hvg"],
							["Hns", "Hms", "Kns", "Wst", "Cty", "Tow", "Nwm", "Bar"],
							[0, "Rch", "Wns", "Lam", "Swr", "Lsh", "Grn", "Bxl"],
							[0, 1, "Kng", "Mrt", "Crd", "Brm", 6,7],
							[0, 1, 2, "Stn", 4, 5, 6,7],
							];

	var boroughCoordinates=[];
	var gridSize=70;
	var buffer=7;

	xCoordinate=buffer;
	yCoordinate=buffer;

	//alert(typeof gridCoordinates[0][4]);
	// locate borough names in top LH corner
	for(i=0; i<gridCoordinates.length; i++){
		for(j=0; j<gridCoordinates[i].length; j++){
			if(typeof gridCoordinates[i][j]=="string"){

					boroughCoordinates.push({borough:"'"+gridCoordinates[i][j]+"'", xCoord:+xCoordinate,yCoord:+yCoordinate});
			}
			xCoordinate+=gridSize+buffer;
		}
	yCoordinate+=gridSize+buffer;
	xCoordinate=buffer;
	}

		// TOOL TIP
		var tooltip=d3.select("body").append("div")
						.style("position","absolute")
						.style("padding","0px")
						.style("opacity","0")
						.style("background", "white")
						.style("border", "2px;")
						.style("text-align","center")
						.style("vertical-align","middle")
						.style("padding","10px")
						.attr("id", "tooltip");

			//console.log(data)
			max=0;

			for(i=0; i<data.length; i++){
				if(parseFloat(data[i].total)>max){
					max=parseFloat(data[i].total); }
				};

			radiusScale=d3.scale.linear()
							.domain([0, max])
							.range([0, (gridSize/1.75)]);

			// create river sections grid/boxes
			for (i=0; i<boroughCoordinates.length; i++){
				for(z=0; z<boroughGrids.length; z++){
					if(boroughCoordinates[i].borough.replace(/'/g, "")==boroughGrids[z].borough){
						canvas.append("svg")
							.attr("height", "85")
							.attr("width", "70")
							.attr("x", boroughCoordinates[i].xCoord)
							.attr("y", boroughCoordinates[i].yCoord-boroughGrids[z].height)
							.append("g")
							.attr("id", boroughGrids[z].borough)
							.attr("transform", boroughGrids[z].transformation)
							.attr("fill", "#fff")
							.append("path")
							.attr("d", boroughGrids[z].path)
							.attr("stroke", "#000")
							.attr("stroke-width","1")
					}
				}
			};

			// remaining sections ie squares
			grids=canvas.selectAll("rect")
						.data(data)
							.enter()
							.append("rect")
							.attr("width", gridSize)
							.attr("height", gridSize)
							.attr("x", function(d){
													for(z=0;z<boroughCoordinates.length; z++){
														if(d.abbreviation==boroughCoordinates[z].borough.replace(/'/g, "")){
															return (boroughCoordinates[z].xCoord) } } })
							.attr("y", function(d){
													for(z=0;z<boroughCoordinates.length; z++){
														if(d.abbreviation==boroughCoordinates[z].borough.replace(/'/g, "")){
															return (boroughCoordinates[z].yCoord) } } })
						.attr("fill", "#fff")
						.attr("stroke", "#000")
						.attr("stroke-width", "1")
						.attr("stroke-opacity", ".1")
						.attr("opacity", function (d){
								if (d.abbreviation=="Wst"||d.abbreviation=="Cty"||d.abbreviation=="Tow"||d.abbreviation=="Nwm"||d.abbreviation=="Bar"||d.abbreviation=="Lam"||d.abbreviation=="Swr"||d.abbreviation=="Lsh"||d.abbreviation=="Grn"||d.abbreviation=="Bxl"){
							return 0 } });

			// create circles using imported data, set colour at the end. Use the named coordinates and grid size to place
			circles=canvas.selectAll("circle")
							.data(data)
							.enter()
							.append("circle")
							.attr("r", function(d){return radiusScale(d.total)})
							.attr("cx", function(d){
														for(z=0;z<boroughCoordinates.length; z++){
														if(d.abbreviation==boroughCoordinates[z].borough.replace(/'/g, "")){
															return (boroughCoordinates[z].xCoord+gridSize/2)
														}
														}
														})
							.attr("cy", function(d){
														for(z=0;z<boroughCoordinates.length; z++){
														if(d.abbreviation==boroughCoordinates[z].borough.replace(/'/g, "")){
															return (boroughCoordinates[z].yCoord+gridSize/2)
														}
														}
														})
							.attr("fill", "url(#grad)")
							.attr("opacity", ".66");

			// label with borough names
			var labels=canvas.selectAll("tspan")
							.data(data)
							.enter()
							.append("text")
							.text(function(d){return d.abbreviation})
							.attr("x", function(d){for(z=0;z<boroughCoordinates.length; z++){
														if(d.abbreviation==boroughCoordinates[z].borough.replace(/'/g, "")){
															return (boroughCoordinates[z].xCoord+buffer)
														}
														}
														})
							.attr("y", function(d){for(z=0;z<boroughCoordinates.length; z++){
														if(d.abbreviation==boroughCoordinates[z].borough.replace(/'/g, "")){
															return (boroughCoordinates[z].yCoord+buffer*2)
														}
														}
														})
							.attr("fill", "#D7D7D7");

				// show actual volume/value in bottom rh corner
				var labels2=canvas.selectAll("tspan")
							.data(data)
							.enter()
							.append("text")
							.text(function(d){return d.total})
							.attr("x", function(d){for(z=0;z<boroughCoordinates.length; z++){

														if(d.abbreviation==boroughCoordinates[z].borough.replace(/'/g, "")){
															var thisWidth = this.getComputedTextLength()
															return (boroughCoordinates[z].xCoord+70-(buffer+thisWidth))
														}
														}
														})
							.attr("y", function(d){for(z=0;z<boroughCoordinates.length; z++){
														if(d.abbreviation==boroughCoordinates[z].borough.replace(/'/g, "")){
															return (boroughCoordinates[z].yCoord+gridSize-buffer)
														}
														}
														})
							.attr("fill", "#D7D7D7")
							.attr("class","labels2")
							.style("opacity",0);

		var total=0;

		for(s=0; s<data.length;s++){
			total += parseFloat(data[s].total);
		}

		circles
		.on("mousemove", function(d){
				tooltip
				.html( "<b>"+d.borough+"</b><br/>"+d.total+"<br/>Percentage of Total: "+Math.round( (d.total/total)*100 * 10) / 10+"%")
				.style("opacity", 1)
						.style("left", function(){
										if(d3.event.pageX+200<$( window ).width()){
											return(d3.event.pageX+10)+"px"
										}
										else{
											return(d3.event.pageX-$("#tooltip").width()-30)+"px"
										}
										})
						.style("top", (d3.event.pageY-20)+"px");
		})
		.on("mouseout", function(){
			tooltip
				.style("opacity", 0)
				.style("left", "-100px")
				.style("top", "-100px")
		})

		grids.on("mousemove", function(d){
			tooltip
			.html( "<b>"+d.borough+"</b><br/>"+d.total+"<br/>Percentage of Total: "+Math.round( (d.total/total)*100 * 10) / 10+"%")
			.style("opacity", 1)
					.style("left", function(){
									if(d3.event.pageX+200<$( window ).width()){
										return(d3.event.pageX+10)+"px"
									}
									else{
										return(d3.event.pageX-$("#tooltip").width()-30)+"px"
									}
									})
					.style("top", (d3.event.pageY-20)+"px");
		})
		.on("mouseout", function(){
			tooltip
				.style("opacity", 0)
				.style("left", "-100px")
				.style("top", "-100px")
		})

		// to create: monthly chart of performance that appears on click
		// use text as place holder
		circles.on("click", function(d){
				d3.selectAll("#bilbo")
					.select("p")
					.remove();
				d3.selectAll("#bilbo")
					.append("p")
					.text(d.borough+" has "+d.total+" reports.");
		})
}
