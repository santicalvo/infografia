import * as d3 from "d3";

let container, recordArray, inCheck;

const zoomed = () => {
    container.attr("transform", "translate(" + d3.event.transform.x + "," + d3.event.transform.y + ") scale(" + d3.event.transform.k + ")");
};

const zoom = d3.zoom()
    .scaleExtent([0.5, 200])
    .on("zoom", zoomed);

function genere(zoom, point) {
    return [{point1: point, point2: {x: point.x + zoom / 2, y: point.y + Math.sqrt(3) / 2 * zoom}},
        {
            point1: {x: point.x + zoom / 2, y: point.y + Math.sqrt(3) / 2 * zoom},
            point2: {x: point.x - zoom / 2, y: point.y + Math.sqrt(3) / 2 * zoom}
        },
        {point1: {x: point.x - zoom / 2, y: point.y + Math.sqrt(3) / 2 * zoom}, point2: point}]
}

function newSegment(segment) {
    let newPoint1 = {},
        newPoint2 = {},
        newPoint3 = {};
    newPoint1.x = 2 / 3 * segment.point1.x + 1 / 3 * segment.point2.x;
    newPoint2.x = 1 / 3 * segment.point1.x + 2 / 3 * segment.point2.x;
    newPoint1.y = 2 / 3 * segment.point1.y + 1 / 3 * segment.point2.y;
    newPoint2.y = 1 / 3 * segment.point1.y + 2 / 3 * segment.point2.y;
    newPoint3.x = (newPoint2.x + newPoint1.x) / 2 + (newPoint2.y - newPoint1.y) * (Math.sqrt(3) / 2);
    newPoint3.y = (newPoint2.y + newPoint1.y) / 2 - (newPoint2.x - newPoint1.x) * (Math.sqrt(3) / 2);
    return [{point1: segment.point1, point2: newPoint1},
        {point1: newPoint1, point2: newPoint3},
        {point1: newPoint3, point2: newPoint2},
        {point1: newPoint2, point2: segment.point2}];
}

function display(arraySegment) {
    container.selectAll("path").remove();
    var path = d3.path();
    path.moveTo(arraySegment[0].point1.x, arraySegment[0].point1.y);
    for (var i = 0; i < arraySegment.length - 1; i++) {
        path.lineTo(arraySegment[i].point2.x, arraySegment[i].point2.y);
    }
    path.closePath();
    container.append("path")
        .attr("d", path.toString())
        .attr("fill", "white")
        .on("mouseover", function () {
            d3.select(this).attr("fill", "#f2f2f2")
        })
        .on("mouseout", function () {
            d3.select(this).attr("fill", "white")
        })
}

function iteration() {
    if (recordArray.length < 9) {
        let arraySegment = recordArray[recordArray.length - 1],
            newArraySegment = [];

        for (var i = 0; i < arraySegment.length; i++) {
            var a = newSegment(arraySegment[i]);
            for (var j = 0; j < a.length; j++) {
                newArraySegment.push(a[j]);
            }
        }
        recordArray.push(newArraySegment)
        display(newArraySegment)
        d3.select("span").text("n = " + recordArray.length)
    }
}

function desIteration() {
    if (recordArray.length > 1) {
        recordArray.pop();
        display(recordArray[recordArray.length - 1])
        d3.select("span").text("n = " + recordArray.length)
    }
}

function iterateKochFlake(times = 6){
    while(times > 0){
        iteration();
        times--;
    }
}

function createKochFlake(svg, dimensions={}) {
    let x = dimensions.x || 0,
        y = dimensions.y || 0,
        size = dimensions.size || 100,
        w = dimensions.w || 960,
        h = dimensions.h || 500;
    recordArray = [genere(size, {x: x, y: y})];
    inCheck = 0;
    if (!svg) {
        svg = d3.select("div")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .style("background-color", d3.schemeCategory20b[Math.floor(Math.random() * 20)])
    }
    let containerGroup = svg.append("g")
    container = containerGroup.append("g");
    display(recordArray[recordArray.length - 1]);
    iterateKochFlake();
    return containerGroup;
}

export {createKochFlake};
