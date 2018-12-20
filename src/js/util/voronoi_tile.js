import {poissonDiscSampler} from "./mesh";
import * as d3 from "d3";
import {generateAllColors} from "./colors";



function getBlueColor(d, i){
    let l;
    try {

        if(!colors){
            l = svg.selectAll('path').size();
            if (l%2 !== 0){
                l +=1;
            }
            colors = generateAllColors(l);

        } else {
            l = colors.length;
        }
    }catch(e){
        console.warn("Error in position ", i, e.message)
        return d3.rgb(255, 0 ,0)
    }
    return i < l ? d3.rgb(colors[i]) : d3.rgb(colors[colors.length -1]);
    //return d3.rgb(255, 0 ,0)
}

function addNodesListeners(nodes){
    setTimeout(() => {

        const printNode = (n) => {
            if(n && n.target){
                let path = n.target;
                console.log(path.getBoundingClientRect())
            }
        };
        nodes.forEach(n => n.addEventListener('click', printNode))
    }, 100)
}

function generateVoronoiGraph(polygonSize, svg, width=900, height=800){
    let sampleSize = polygonSize || 25;
    let sampler = poissonDiscSampler(width, height, sampleSize),
        samples = [],
        sample;

    while (sample = sampler()) samples.push(sample);
    let voronoi = d3.voronoi()
        .extent([[-1, -1], [width + 1, height + 1]]);
    if(!svg){
        svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);
    }

    let backgroundTile = svg.append('g')
        .attr('id', 'backgroundTile');
    let allPaths = backgroundTile.selectAll("path");
    let data = voronoi(samples);
    allPaths.data(data.polygons())
        .enter().append("path")
        .attr("d", (d) => "M" + d.join("L") + "Z")
        .attr("id", (d, i) => 'i_'+i);
    //.style("fill", (d, i) => getBlueColor(d.point, i))
    //.style("stroke", (d) => d3.rgb(colors[0]));
    return backgroundTile;
}

function sortByV(nodeA, nodeB){
    const ra = nodeA.getBoundingClientRect(),
        rb = nodeB.getBoundingClientRect(),
        v1 = rb.x - ra.x,
        v2 = rb.y - ra.y;
    if ( (v1 >= 0 && v2 < 0) || (v1 < 0 && v2 <= 0) ) {
        return 1
    } else {
        return -1;
    }
}

function paintNodes(nodes, colorRange = ['#a0f7eb', '#036cb2']){
    const l = nodes.length;
    const totalNodes = l  % 2 === 0 ? l : l + 1;
    const colors = generateAllColors(totalNodes, colorRange);
    //const strokeColor = d3.rgb(colors[colors.length / 2]);
    const strokeColor = d3.rgb(255, 255, 255, 0.3);
    //strokeColor.opacity = 0.5;

    window.nodes = nodes;
    nodes.forEach((node, i) => {
        const d3Node = d3.select(node);
        const id = d3Node.attr('id');
        d3Node
            .style("fill", () => colors[i])
            //.style("stroke", () => colors[0])
            .style("stroke", () => strokeColor)
            .attr("id", () => id + '_' + i);
    });
    return colors;
}

function paintColorBars(colors){
    const barHeight = 20;
    const width = 400;
    let colorBarContainer = document.createElement('div');
    colorBarContainer.className = 'bar-container';
    document.body.appendChild(colorBarContainer);
    let chart = d3.select(".bar-container").append('svg');

    chart.attr("height", barHeight * colors.length);
    let bar = chart.selectAll("g")
        .data(colors)
        .enter().append("g")
        .attr("transform", (d, i) => "translate(0," + i * barHeight + ")")
        .attr("id", (a, i) => "id_"+i);

    bar.append("rect")
        .attr("width", () => width)
        .attr("height", barHeight - 1)
        .style('fill', (a, b) =>{
            return a;
        });

    bar.append("text")
        .attr("x", (d, i) => {
            return 10
        })
        .style('fill', 'white')
        .attr("y", barHeight / 2)
        .attr("dy", ".20em")
        .style('fill', (a, b) =>{
            return 'rgb(255, 255, 255)';
        })
        .style("font-size", "12px")
        .text((d) => d);
}

function generateVoronoiTileBackground(svg, width=900, height=500, color1='#d5d5d5', color2='#3252CB'){
    const polygonSize = 10;
    const tile = generateVoronoiGraph(polygonSize, svg, width, height);
    let nodes = d3.selectAll('path').nodes();
    nodes.sort(sortByV);
    const colors = paintNodes(nodes, [color1, color2]);
    addNodesListeners(nodes);
    return tile;
}

export { generateVoronoiTileBackground }
