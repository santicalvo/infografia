import * as d3 from "d3";
import * as topojson from "topojson";
import {getRandomColor} from "./colors";

function generateMaladetaPosition(svgSelection){
    const maladetaPosition = {
        x: 425,
        y: 115
    }
    const circleSelection = svgSelection.append("circle")
        .attr("cx", maladetaPosition.x)
        .attr("cy", maladetaPosition.y)
        .attr("r", 5)
        .style("fill", "black")
        .attr('id', 'maladeta_in_spain')
        .attr('opacity', 0);
    return circleSelection;
}

function generateSpain(svg, width = 900, height=900){
    let projection = d3.geoMercator().scale(2300)
        .center([1, 36])
        .translate([width / 2, height / 2]);;
    if(!svg){
        svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);
    }

    let path = d3.geoPath()
        .projection(projection);
    let g = svg.append("g").attr('id', 'spain');
    let i = 0;
    return d3.json("assets/spain-province.json")
        .then(topology => {
            //FUCK THE REALLY BAD DOCUMENTATION TO GET DATA!!!!
            const topoData = topojson.feature(topology, topology.objects.ESP_adm2).features;
            g.selectAll("path")
                .data(topoData)
                .enter()
                .append("path")
                .attr("d", path)
                .attr('id', (a, b)=> {
                    let province = a && a.properties ? a.properties.NAME_2 : Math.random() +'' ;
                    return province.toLowerCase();
                })
                .style('fill', () => getRandomColor())
                //.style('fill', '#219aff')
                .style('stroke', '#ffffff');
            generateMaladetaPosition(g);
            return g;
        });

}

export {generateSpain};
