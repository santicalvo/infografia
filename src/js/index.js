import * as d3 from "d3";
import '../scss/main.scss';
import {createKochFlake} from "./util/kochsnowflake";
import {paintGlacierInMap, changeArrowPath} from "./util/glacier_drawing";
import { generateVoronoiTileBackground } from "./util/voronoi_tile";
import {paintGlaciers} from "./util/glacier_history";
import {colors, blueGradient, contrastColors} from "./util/colors";

window.d3 = d3;

const width = 560,
    height = 1200;

//ñapa
const mapOffsetHeight = 30;

let mainBlue = '#3a51bc';

//let colorScale = ;
let tileColor1 =  blueGradient[0];
let tileColor2 =  blueGradient[19]
const blockBackGround = colors[3];
const mapBackGround = colors[16];
const defaultStrokeWidth = 2;
const defaultCorners = 5;
const defaultOpacity = 0.8;
const textColor = '#ffffff';


const margin = 10;

const maxSizeYear = 1857;
const middleSizeYear = 1994;
const lowestSizeYear = 2013;

const maladateSizeEvolution = {
    mountainYears: [ [maxSizeYear, 148.5], [middleSizeYear, 42], [lowestSizeYear, 25 ] ],
    flakeYears: [1994, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2013],
    hectares: [42, 38, 37, 35, 35, 33, 31, 28, 29, 28, 28, 25, 25]
};
const fontFamily = 'helvetica, verdana, sans-serif';
const maxSizeLast20years = Math.max(...maladateSizeEvolution.hectares);
maladateSizeEvolution.scales = maladateSizeEvolution.hectares.map(val => val / maxSizeLast20years);

const clearSvg = () => (document.getElementsByTagName('svg')[0] || {remove: () => {}}).remove();
const isD3object = (d3ob) => d3ob ? Object.keys(d3ob).toString() === "_groups,_parents" : false;
const rndId = (prefix = '_') => prefix + Math.random().toString(36).substr(2, 9);
const d3Rect = (element) => isD3object(element) ? element.node().getBoundingClientRect() : {};
const d3BBbox = (element) => isD3object(element) ? element.node().getBBox() : {};
const computeTranslate = (props) => props ? 'translate(' + (props.x || 0) + ',' + (props.y || 0) + ')' : '';
const wait = (args, t) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(args)
        }, t);
    })
};
const computeScale = (props, rect = {}) => {
    if (!props) return '';
    let widthScale, heightScale;
    let scale = '';
    if (props.width && props.height) {
        widthScale = props.width / rect.width;
        heightScale = props.height / rect.height;
        scale = 'scale(' + widthScale + ',' + heightScale + ')';
    } else if (props.height && !props.width) {
        scale = 'scale(' + (props.height / rect.height) + ')';
    } else if (!props.height && props.width) {
        scale = 'scale(' + (props.width / rect.width) + ')';
    }
    return scale;
};

function roundedSquareCanvas(parentNode, props) {
    const corners = props.corners || defaultCorners;
    const fill = props.fill || colors[0];
    const stroke = props.stroke || colors[0];
    const strokeWidth = 'strokeWidth' in props ? props.strokeWidth : defaultStrokeWidth;
    const x = props.x || 0;
    const y = props.y || 0;
    const id = props.id || rndId();
    const width = props.width || 250;
    const height = props.height || 250;
    const squareGroup = parentNode.append('g').attr('id', id);
    const opacity = 'opacity' in props ? props.opacity : 1;
    squareGroup.append("rect")
        .attr("rx", corners)
        .attr("ry", corners)
        .attr("x", x)
        .attr("y", y)
        .attr("width", width)
        .attr("height", height)
        .attr("opacity", opacity)
        .style('fill', fill)
        .style('stroke', stroke)
        .style("stroke-width", strokeWidth);
    return squareGroup;
}

function centerToElement(element, referent) {
    const elementRect = d3Rect(element);
    const refRect = d3Rect(referent);
    const left = refRect.left - elementRect.left + (refRect.width - elementRect.width) / 2;
    const top = refRect.top - elementRect.top + (refRect.height - elementRect.height) / 2;
    element.attr('transform', 'translate(' + left + ',' + top + ')');
}

function renderTitle(svg) {
    const marginDoble = margin * 2;
    const titleProps = {
        id: 'title',
        x: marginDoble,
        y: margin,
        strokeFill: 'none',
        opacity: defaultOpacity,
        width: width - marginDoble * 2,//width - margin * 2,
        height: 40,
        fill: blockBackGround,
        //corners: 10,
        //strokeWidth: 0,
        fontSize: 30
    };
    const titleText = 'El deshielo de la Maladeta';
    const square = roundedSquareCanvas(svg, titleProps);
    const textContainer = square.append('g').attr('id', 'title_text_group');
    textContainer
        .append('text')
        .attr('font-family', fontFamily)
        .text(titleText)
        .attr('fill', textColor)
        .attr('x', 0)
        .attr('y', titleProps.fontSize)
        .attr('font-size', titleProps.fontSize);
    centerToElement(textContainer, square.select('rect'));
    return square;
}

function positionMap(maladeta, map) {
    const maladetaRect = d3Rect(maladeta);
    const mapWithArrow = map.select('#spain_with_arrow');
    const mapRect = d3Rect(mapWithArrow);
    const rectangle = d3.select(map.node()).select('rect');
    const rect = d3Rect(rectangle);
    const scaleFactor = 0.7; //Reduction factor
    const scaleProps = {width: (rect.width - mapRect.left) * scaleFactor};
    const scale = computeScale(scaleProps, mapRect);
    const translateProps = {
        x: margin * 2,
        y:  -margin
    };
    let translate = computeTranslate(translateProps);
    mapWithArrow.attr('transform', scale + ' ' + translate);

}

function positionMaladetaMap(maladetaMap, props = {}) {
    const rectMaladeta = d3Rect(maladetaMap);
    const rect = d3Rect(d3.select(maladetaMap.node().parentNode).select('rect'));
    const maladetaRect = d3Rect(maladetaMap);
    let scale = '', translate = '';
    let dummyOffset = 4;
    let xMap = rect.left + rect.width - maladetaRect.x - maladetaRect.width - margin*2;
    let yMap = rect.y + (rect.height -maladetaRect.height - margin) + window.scrollY;
    props = {
        x: xMap,
        y: yMap - margin * 2
    };

    translate = computeTranslate(props);
    maladetaMap.attr('transform', translate + ' ' + scale);
}

function renderMap(svg, rect={}) {
    const marginDoble = margin * 2;
    const mapSquareProps = {
        id: rndId('map_'),
        //corners: margin,
        x: marginDoble,
        y: margin,
        //stroke: colors[33],
        opacity: defaultOpacity,
        //fill: '#ff0000',
        fill: mapBackGround,
        width: width - marginDoble * 2,
        //strokeWidth: 3,
        height: 330
    };
    const mapGroup = roundedSquareCanvas(svg, mapSquareProps);
    const rectInMap = mapGroup.select('rect');

    //ñapa
    setTimeout(() => {
        rectInMap.attr('height', +rectInMap.attr('height') - 30);
    }, 200);

    //rectInMap.attr('height',  +rectInMap.attr('height') - mapOffsetHeight)
    //const h = +rectInMap.attr('height') - mapOffsetHeight;
    let maladetaMap;
    return paintGlacierInMap(mapGroup)
        .then(mapGroup => {
            maladetaMap = mapGroup.select('#glaciar_map_drawing');
            positionMaladetaMap(maladetaMap);
            return {maladeta: maladetaMap, map: mapGroup};
        })
        .then(mapOb => {
            positionMap(mapOb.maladeta, mapOb.map);
            if(rect && rect.height){
                window.rect = rect;
                window.mapGroup = mapGroup;
                mapGroup.attr('transform', computeTranslate({x: 0, y: rect.height + margin}))
            }
            return mapOb;
        })
        .then(mapOb => wait(mapOb, 100))
        .then(mapOb => {
            const glacier = d3.select('#glaciar_map_drawing');
            glacier.style('visibility', 'visible');
            glacier.node().removeAttribute('style');
            changeArrowPath([35, 170],[185, 415]);
            return mapOb;
        })
        .catch(er => console.warn(er));
}

function renderTile(svg){
    return generateVoronoiTileBackground(svg, width, height, tileColor1, tileColor2)
}

function paintSnowFlakes(svg) {
    const marginDoble = margin * 2;
    const rect = d3Rect(svg);
    const availableHeight = rect.height;
    const padding = 9;
    const leftLegendRect = d3Rect(d3.select('#left_legend'));
    let blockHeight =  Math.floor(availableHeight / (maladateSizeEvolution.scales.length)) - padding;
    let flakeSize = blockHeight - padding;//;
    let flakesContainer = svg.append('g').attr('id', 'flakes_container');
    let node = null;
    window.sq = null;
    const getNode = () => {
        if (!node) {
            const flakeSquareProps = {
                x: 0,
                y: 0,
                opacity: defaultOpacity,
                fill: mapBackGround,
                width: leftLegendRect.width,
                //strokeWidth: 0,
                height: blockHeight,
                //corners: margin
            };
            const flakeSquareContainer = flakesContainer.append('g').attr('class', 'flake-block');
            const flakeSquare = roundedSquareCanvas(flakeSquareContainer, flakeSquareProps);
            let kochFlake = createKochFlake(flakeSquare, {
                size: flakeSize,
                x: Math.floor(flakeSize / 2),
                y: 0
            });
            kochFlake.attr('class', 'snow-flake');
            node = flakeSquare.node();

            return node;
        }
        const clonedNode = node.cloneNode(true);
        return clonedNode;
    };
    //let anode = getNode()
    //iterateKochFlake(6);

    let snowFlakes = maladateSizeEvolution.scales.map((scale, i) => {
        const newFlake = getNode();
        node.parentNode.appendChild(newFlake);
        let id = 'year_' + maladateSizeEvolution.flakeYears[i] + '_'
            + maladateSizeEvolution.hectares[i];
        let flake = d3.select(newFlake)
            .attr('id', id);
        return flake;
    });
    //snowFlakes = [snowFlakes[0]]

    const yFlake = (blockHeight - flakeSize) / 2;
    const fontSize = 25;
    snowFlakes.forEach((flake, i) => {
        let y = i * (blockHeight + margin);
        let rect = d3Rect(flake);
        let text = flake.append('text')
        .text(maladateSizeEvolution.flakeYears[i]+': '+maladateSizeEvolution.hectares[i] + ' ha');
        text.attr('font-size', fontSize)
            .attr('font-family', fontFamily)
            .attr('fill', textColor);
        let transformFlakeGroup = '';
        let transformScaleFlake = 'scale(' + maladateSizeEvolution.scales[i] + ')';
        let snowFlake = flake.select('g');
        if (y > 0) {
            transformFlakeGroup += ' translate(0, ' + y + ')';
        }
        flake.attr('transform', transformFlakeGroup);
        let txtRect = d3Rect(text);
        let translateXTxt = 80;
        let fixedY = txtRect.height + (blockHeight - txtRect.height)/2 -4;
        text.attr('transform', 'translate('+translateXTxt+', ' + fixedY + ')');
        let bgRect = flake.select('rect');
        let rectFlakeRect = d3Rect(bgRect);
        //bgRect.attr('width', txtRect.left+ txtRect.width +translateXTxt)
        let snowLeft = rectFlakeRect.left ;
        snowFlake.attr('transform', computeTranslate({x: snowLeft + margin, y: 0}) + ' '+transformScaleFlake);

    });
     snowFlakes.forEach((flake, i) => {
        let snowFlakeOutter = flake.select('g');
        let snowFlake = snowFlakeOutter.select('g');
        let snowFlakeRect = d3Rect(snowFlake);
        let fixedY = (blockHeight - snowFlakeRect.height)/2;
        let transformStr = snowFlakeOutter.attr('transform');
        //FUCK we need to apply transform on this element, it is not possible on a child one!!!!!
        let newTransform = transformStr.replace(/translate\((\d+),(\d+)\)/, 'translate($1,'+fixedY+')');
        snowFlakeOutter.attr('transform', newTransform);
    });
    return flakesContainer;
}

function renderSnowFlakes(flakesSquareGroup, rect){
    const marginDoble = margin * 2;
    const lastY = rect.top + rect.height;
    const flakesRect = d3Rect(flakesSquareGroup);
    const startY = lastY - flakesRect.y + marginDoble;
    const snowFlakes = paintSnowFlakes(flakesSquareGroup);
    return flakesSquareGroup;
}

function renderGlaciers(svg){
    const svgRect = d3Rect(svg);
    const marginDoble = margin * 2;
    console.log(svg)
    const glacierSquareProps = {
        id: 'glacier_history',
        x: 0,
        y: 0,
        opacity: 0,
        width: svgRect.width/2 -margin,
        height: svgRect.height
    };

    const glaciersHistoryGroup = roundedSquareCanvas(svg, glacierSquareProps);
    const maxSize = maladateSizeEvolution.mountainYears[0][1];
    const sizeScales = maladateSizeEvolution.mountainYears
                        .map(yearSizeAr => yearSizeAr[1] / maxSize);
    const glaciers = paintGlaciers(glaciersHistoryGroup, sizeScales);
    const twoMountains = glaciers.selectAll('.two-mountains');
    const tmg = twoMountains.select('.two-mountains-group');
    const tmgr = d3Rect(tmg);
    const sqrRect = d3Rect(glaciersHistoryGroup.select('rect'));
    const scaleFactor = 1.4;

    const athird = sqrRect.height/3;
    const athirdOffset = 50;
    const mountainsY = [0, athird, athird*2];

    const xMountains = (sqrRect.width - tmgr.width*1.5)/2 ;

    const glacierTexts = twoMountains
        .append('g')
        .attr('transform', 'translate('+xMountains+', 110)')
        .append('text')
        .text(function(a, i){
            const year = maladateSizeEvolution.mountainYears[i];
            return year[0] + ': ' +year[1] + ' hectáreas';
        })
        .attr('fill', textColor)
        .attr('font-size', 15)
        .attr('font-family', fontFamily);

    twoMountains.attr( 'transform', (a, i) => 'translate(0, ' + (mountainsY[i] + athirdOffset) + ') scale('+scaleFactor+')' );
    const rightLegendRect = d3Rect(d3.select('#right_legend'));
    glaciersHistoryGroup.attr('transform', computeTranslate({x:rightLegendRect.x - marginDoble , y: 0}));
    tmg.attr('transform', () => 'translate(' + (xMountains + 10) + ', 0)');
    let mountainsRect = d3Rect(tmg);
    //let maxWidth = 150;
    const textNodes = Array.from(glacierTexts.nodes());
    const boxes = textNodes.map(node => node.getBBox().width)
    let maxWidth = Math.max( ...textNodes.map(node => node.getBBox().width) );
     textNodes.forEach(node => {
        const bbox = node.getBBox();
        const parent = node.parentNode;
        const box = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        parent.insertBefore(box, node);
        console.log(boxes);
        const padding = 4;
        const rectWidth = maxWidth + padding;
        const rect = d3.select(box)//parent.append("rect")
            .attr("x", bbox.x)
            .attr("y", bbox.y - padding/2)
            .attr("width", rectWidth)
            .attr("height", bbox.height + padding)
            .style("fill", colors[19])
            .style("stroke", colors[0])
            .style("stroke-width", '#ffffff');
        let centerX = (rectWidth - bbox.width)/2
        node.setAttribute('transform', 'translate(' + centerX + ', 0)' )

     });

}

function renderLegends(svg, rect={}){
    const marginDoble = margin * 2;
    const lastY = rect.top + rect.height;
    const availableSpace = height - lastY - window.scrollY;
    const rectWidth = rect.width/2 - margin;
    const rectHeight = 80;
    let squareLeftProps = {
        id: 'left_legend',
        x: marginDoble,
        y: 0,
        fill: blockBackGround,
        opacity: defaultOpacity,
        //corners: margin,
        width: rectWidth,
        height: rectHeight,
        //strokeWidth: defaultStrokeWidth
    };
    const leftLegendGroup = roundedSquareCanvas(svg, squareLeftProps);
    const leftLegendRect = d3Rect(leftLegendGroup);
    const startY = lastY - leftLegendRect.y + margin;
    const leftSquarePosition = {
        x: 0,
        y: startY
    };
    leftLegendGroup.attr('transform', computeTranslate(leftSquarePosition));

    let squareRightProps = Object.assign({}, squareLeftProps);
    squareRightProps.id  = 'right_legend';

    const rightLegendGroup = roundedSquareCanvas(svg, squareRightProps);
    //const startY = lastY - leftLegendRect.y + marginDoble;
    const rightSquarePosition = {
        x: width - squareLeftProps.width - marginDoble * 2,
        y: startY
    };
    rightLegendGroup.attr('transform', computeTranslate(rightSquarePosition));

    const leftText = renderLeftText(leftLegendGroup);
    const rightText = renderRightText(rightLegendGroup);
    const leftTextBox = d3Rect(leftText);
    const rightTextBox = d3Rect(rightText);
    console.log('lay ', (rectHeight - leftTextBox.height)/2)
    leftText.attr('transform', computeTranslate({x: (rectWidth - leftTextBox.width)/2,
                                    y: -(rectHeight - leftTextBox.height)/2 }));
    rightText.attr('transform', computeTranslate({x: (rectWidth - rightTextBox.width)/2,
                                    y: -(rectHeight - rightTextBox.height)/2 }));
    return leftLegendGroup;
}

function createLegendText(svg, text, fSize = 17){
    const  fontFamily = "fantasy";//  font-family = "fantasy"
    return svg.append('text')
        .attr('class', 'legend')
        .attr('font-family', 'helvetica, verdana, sans-serif')
        //.text(legend)
        .attr('fill', '#ffffff')
        .attr('font-size', fSize).html(text)
}

function renderLeftText(svg){
    const marginDoble = margin * 2;
    const interlineado = marginDoble + 5;
    const max = Math.max(...maladateSizeEvolution.hectares);
    const min = Math.min(...maladateSizeEvolution.hectares);
    const loss = (100 - (min * 100 / max)).toFixed(1);
    const legendGroup = svg.append('g').attr('class', 'legend');
    let firstSentence = `<tspan x="${marginDoble}" dy="${interlineado}">En 20 años el Glaciar de la </tspan>
    <tspan x="${marginDoble}" dy="${interlineado}">Maladeta ha perdido</tspan>
    <tspan x="${marginDoble}" dy="${interlineado}">el ${loss}% de su superficie.</tspan>`;

    return createLegendText(legendGroup, firstSentence);

}

function renderRightText(svg){
    const marginDoble = margin * 2;
    const interlineado = marginDoble + 5;
    const legendGroup = svg.append('g').attr('class', 'legend');
    let firstSentence = `<tspan x="${marginDoble}" dy="${interlineado}">Desde 1857 han desaparecido </tspan>
    <tspan x="${marginDoble}" dy="${interlineado}">123 hectáreas de hielo</tspan>
    <tspan x="${marginDoble}" dy="${interlineado}">más del 80%.</tspan>`;
    return createLegendText(svg, firstSentence);
}

function renderBottomLegends(svg, rect={}){
    const marginDoble = margin * 2;
    let bottomHeight = 20;
    let props = {
        id: 'bottom_messages',
        x: marginDoble,
        y: 0,
        width: width - marginDoble * 2,
        fill: blockBackGround,
        opacity: defaultOpacity,
        height: bottomHeight    };

    const bottomGroup = roundedSquareCanvas(svg, props);
    const fSize = 14;
    bottomGroup.attr('transform', 'translate(0, '+ (height - bottomHeight - margin) +')');
    const url = 'https://www.miteco.gob.es/es/agua/temas/evaluacion-de-los-recursos-hidricos/ERHIN/glaciares-evolucion/';
    const firstSentence = `<tspan x="${marginDoble}" dy="${marginDoble}">Glaciares - Evolución y situación actual. Ministerio para la transición ecológica</tspan>`;
    const text = createLegendText(bottomGroup, firstSentence, fSize);
    text.attr('transform', 'translate(15, -5)')
    bottomGroup.on('click', ()=>{
        const redirectWindow = window.open(url, '_blank');
        redirectWindow.location;
    });

    return bottomGroup
}

function renderAvailableSpace(svg, top, bottom){
    let topRect = d3Rect(top);
    let bottomRect = d3Rect(bottom);
    let topY = topRect.y + topRect.height;
    let bottomY = bottomRect.y;
    const marginDoble = margin * 2;
    let props = {
        id: 'available_space',
        x: 0,
        fill: '#dd3a64',
        y: 0,
        opacity: 0,
        width: width - marginDoble * 2,
        height: bottomY - topY - marginDoble
    };

    const availableGroup = roundedSquareCanvas(svg, props);
    availableGroup.select('rect').attr('class', 'bg-content-rect');
    availableGroup.attr('transform', 'translate(' + marginDoble +', '+ ( topY + margin + window.scrollY ) +')');
    return availableGroup;
}

function main() {
    clearSvg();
    //window.scrollTo(0, 0);
    let map;
    let svg = d3.select("#svg_container")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background-color", d3.schemeCategory10[Math.floor(Math.random() * 10)]);

    const tile = renderTile(svg);
    const title = renderTitle(svg);
    let legends, bottomLegends;
    renderMap(svg, d3Rect(title))
        .then(map => {
            const mapRect = d3Rect(map.map);
            legends = renderLegends(svg, mapRect);
            return legends;
        })
        .then(() => {
            bottomLegends = renderBottomLegends(svg);
            return bottomLegends;
        })
        .then( () => {
            return renderAvailableSpace(svg, legends, bottomLegends);
        })
      .then(availableContainer => {
            const mapRect = d3Rect(availableContainer);
            const snowFlakesGroup = renderSnowFlakes(availableContainer, mapRect);
            return snowFlakesGroup;
        })
       .then(snowFlakesGroup => {
            //snowFlakesGroup.select('#flakes_container').attr('visibility', 'hidden');
            let glaciers = renderGlaciers(snowFlakesGroup)
            return snowFlakesGroup;
        })
        .then(txt => console.log('end '));
}

main();
window.d3Rect = d3Rect;
//window.main = main;
/*document.addEventListener('DOMContentLoaded', () => {
    let defaultColor1 = '#d5d5d5';
    let defaultColor2 = '#3252CB';
    const inputColor1 = document.getElementById('color1');
    const inputColor2 = document.getElementById('color2');

    setTimeout(() => {
        inputColor1.value = defaultColor1;
        inputColor2.value = defaultColor2;
        inputColor1.style.backgroundColor = defaultColor1;
        inputColor2.style.backgroundColor = defaultColor2;
        main();
        window.d3Rect = d3Rect;
        window.main = main;

    }, 100)
});*/

