import * as d3 from "d3";

const colors = ["#cde7ff",
"#7a90ea",
"#51fbfb",
"#658ad0",
"#03f3fd",
"#9cb1ff",
"#61d0cf",
"#3b8fd9",
"#98f9ff",
"#969ed7",
"#71f3ff",
"#7e8aa9",
"#00defc",
"#9ea1c3",
"#01becc",
"#c0c4f0",
"#44a4a4",
"#4fb5ff",
"#88e2e1",
"#009de3",
"#c9e8f0",
"#02a1d6",
"#9bc7c6",
"#658dbc",
"#a4ebff",
"#748ea1",
"#56d1ff",
"#a8b2c6",
"#00b8d7",
"#91afb7",
"#00b0d9",
"#7cc2c1",
"#9ad5ff",
"#1b97b4",
"#5792a9"];

const contrastColors = ['#c0b10c']

const blueGradient = ["#cde7ff",  "#009de3"];
//const blueGradient = [colors[0],  colors[19]];

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomColor(someColors){
    if(!Array.isArray(someColors)){
       someColors = [
            "#3b8fd9",
            "#00defc",
            "#4fb5ff",
            "#009de3",
            "#02a1d6",
            "#00b8d7",
            "#00b0d9",
            "#5792a9"];

    }
    const i = getRandomInt(0, someColors.length-1);
    return someColors[i];
}

function generateAllColors(l, colorRange = ['#a0f7eb', '#036cb2'] ){
    const colorScale = d3.scaleLinear(d3.interpolateRgb);
    colorScale.domain([0, l])
        .range(colorRange);
    return Array(l).fill('')
        .map((color, i) => colorScale(i))
        .reverse();
}

export {
    colors, contrastColors, getRandomColor, getRandomInt, generateAllColors, blueGradient
};
