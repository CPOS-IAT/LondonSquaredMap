function choropleth(){
bubbleChartBool=false
choroplethBool=true;

d3.csv("data/testData.csv", function(error, data) {
	circles.transition().duration(500)
		.attr("r", 0);

	grids.transition().duration(500)
		.attr("fill", function(d){return colorScale(d.total)})


	for(i=0; i<boroughGrids.length; i++){
		var ooo;
		for (j=0; j<data.length; j++){
			if(data[j].abbreviation==boroughGrids[i].borough){
				ooo=j;

			}
		}
		x="#"+boroughGrids[i].borough;
		d3.select(x).transition().duration(500)
		.attr("fill", function(d){return colorScale(data[ooo].total)})

		}
	d3.selectAll(".labels2").transition().duration(500).style("opacity",1);
})
}


function bubbleChart(){
bubbleChartBool=true
choroplethBool=false;

d3.selectAll("#bilbo").select("p").remove();

d3.csv("data/testData.csv", function(error, data) {
	circles.transition().duration(500)
		.attr("r", function(d){return radiusScale(d.total)})

	grids.transition().duration(500)
		.attr("fill", "#fff");



	for(i=0; i<boroughGrids.length; i++){

		x="#"+boroughGrids[i].borough;
		d3.select(x).transition().duration(500)
		.attr("fill", "#fff");

		}
	d3.selectAll(".labels2").transition().duration(500).style("opacity",0);
})
}
