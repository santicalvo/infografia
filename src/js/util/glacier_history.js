import {paintSnowFlake} from "./snow_flakes";
import * as colors from "./colors";

const getRandomInt = colors.getRandomInt;
//0171bb
const mountainColor = colors.colors[19];//'#009de3';//colors.colors[ colorPos ] //'#0171bb';

const glacier = `
<g class="glacier-container">
  <g
     id="layer2"
     style="display:inline"
     transform="translate(6.963532e-8,-204.39583)">
    <path
       style="display:inline;opacity:1;fill:${mountainColor};fill-opacity:1;fill-rule:nonzero;stroke:#ffffff;stroke-width:3.35840201;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
       d="M 1.6920159,294.73714 57.477655,206.07489 114.30692,295.3006"
       class="mountain-side">
      <title
         id="title916">ladera</title>
    </path>
  </g>
  <g
     id="layer3"
     style="display:inline"
     transform="translate(6.963532e-8,-204.39583)">
    <path
       style="display:inline;opacity:1;fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:3.35840201;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
       d="M 6.1966122,294.73715 57.477651,212.83178 109.80233,295.3006 86.299705,269.37912 57.999473,295.01887 31.760924,269.37912 Z"
       class="ice">
      <title
         id="title914">ice</title>
    </path>
  </g>
</g>`;


function paintGlacier_2(svg, glacier) {
    const mountains = svg.append('g').html(glacier);
    const mountainsNode = mountains.attr('class', 'mountains').node();
    const mountainsChild = mountains.select('g').attr('class', 'mountain');
    const mountainNode = mountainsChild.node();
    const newMountainNode = mountainNode.cloneNode(true);
    mountainsNode.insertBefore(newMountainNode, mountainNode);
    d3.select(newMountainNode).attr('transform', 'translate(50, 4) scale(0.9)');
    window.mountains = mountains
    return mountains;
}

function paintGlacier(svg, glacier) {
    const mountains = svg.append('g')
    .attr('class', 'two-mountains-group').html(glacier);
    return mountains;
}

function scaleIce(elem, scaleFactor){
    const bbox = elem.getBBox();
    const erect = elem.getBoundingClientRect();
    elem.setAttribute('transform', 'scale(' + scaleFactor + ')');
    const erect1 = elem.getBoundingClientRect();
    const peakX = erect.width / 2;
    const peak1X = erect1.width / 2;
    const widthOffset = peakX - peak1X;
    const heightOffset = erect.height * scaleFactor;
    const tx1 = -bbox.x;
    const ty1 = -bbox.y;
    const tx2 = bbox.x;
    const ty2 = bbox.y;
    const transform = `translate(${widthOffset}, 0) translate(${tx2}, ${ty2}) scale(${scaleFactor}) translate(${tx1}, ${ty1})`;
    elem.setAttribute('transform', transform);
    return elem
}

function duplicateMountain(frontMountain){
    const backMountain = frontMountain.cloneNode(true);
    const parent = frontMountain.parentNode;
    parent.insertBefore(backMountain, frontMountain);
    frontMountain.setAttribute('class', 'front-glacier-mountain');
    backMountain.setAttribute('class', 'back-glacier-mountain');
    backMountain.setAttribute('transform', 'translate(40, 10) scale(0.8)');
    const d3Parent = d3.select(parent);
    const snowFlake = paintSnowFlake(d3Parent.append('g'), getRandomInt(0, 5));

    return d3Parent;
}


//Array.from(document.getElementsByClassName('two-mountains')).forEach(el => el.removeAttribute('transform'))
//d3.selectAll('.two-mountains').attr( 'transform', (a, i) => 'translate(100, ' + (200 * (i+1)) + ') scale(1.5)' )
function paintGlaciers(svg, sizeScales) {
    let glaciers = [];
    const historyGroup = svg.append('g').attr('id', 'history_group');

    sizeScales.forEach(scale => {
        //onsole.log(scale, i)
        const mountainsGroup = historyGroup.append('g').attr('class', 'two-mountains');
        const glacierEl = paintGlacier(mountainsGroup, glacier);
        const ice = glacierEl.select('.ice');
        scaleIce(ice.node(), scale);
        const frontMountain = glacierEl.select('.glacier-container').node();
        const mountainGroup = duplicateMountain(frontMountain);
        const flake = mountainsGroup.select('.mountain-snow');
        flake.attr('transform', 'translate(50, -30) scale(0.4)');
        glaciers.push(mountainsGroup);

    });
    window.glaciers = glaciers
    //ñaaaaapaaaaaa
    /*const mountainsY = [-66 , 130, 425]
    d3.selectAll('.two-mountains')
        .attr( 'transform', (a, i) => 'translate(0, ' + mountainsY[i] + ') scale(1.5)' );
    historyGroup.attr('transform', 'translate(0, 100)');*/
    return historyGroup;
}


function localCoordsToSvgCoords(x, y, el) {
    var offset = svgDoc.getBoundingClientRect();
    el = el || elem;
    var matrix = el.getScreenCTM();

    return {
        x: (matrix.a * x) + (matrix.c * y) + matrix.e - offset.left,
        y: (matrix.b * x) + (matrix.d * y) + matrix.f - offset.top
    };
}

function globalCoordsToElementCoords(screenPointX, screenPointY, someSvgObject)
{
  var screenPoint = document.getElementsByTagName('svg')[0].createSVGPoint();
  screenPoint.x = screenPointX;
  screenPoint.y = screenPointY;
  var CTM = someSvgObject.getScreenCTM();
  return screenPoint.matrixTransform( CTM.inverse() );
}

function createSquare(x, y) {
    var square = d3.select('svg').append("line")
        .attr("x1", 100)
        .attr("y1", 0)
        .attr("x2", 100)
        .attr("y2", 1500).attr("stroke-width", 2)
        .attr("stroke", "red");

}

function createCircle(x, y, r, id) {
    const el = d3.select('svg').append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", r || 5)
        .attr("fill", "#ff0000")
        .on('click', function(){
            this.parentNode.removeChild(this)
        });
    if(id){
        el.attr('id', id)
     }
}

function createRect(x, y, w, h, id) {
    const el = d3.select('svg')
        .append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", w || 10)
        .attr("height", h || 10)
        .attr("fill", "#cd46ff").on('click', function(){
            this.parentNode.removeChild(this)
        });
     if(id){
        el.attr('id', id)
     }
}

export {paintGlaciers, paintGlacier}

/*


const glacier1 = `<g
     id="layer1">
    <path class="hielo" transform="translate(100, 100)"
     id="dummy_rect"
     d="M 0,0 H 400 L 0,400 Z"
     style="fill:#000080;fill-opacity:1;fill-rule:nonzero;stroke:#7171ff;stroke-width:1.20189536;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
  </g>`;

window.createRect = createRect;
window.createCircle = createCircle;
window.localCoordsToSvgCoords = localCoordsToSvgCoords;
window.globalCoordsToElementCoords = globalCoordsToElementCoords;
window.scaleInPosition = scaleInPosition;
    var line1 = d3.select('svg').append("line")
        .attr("x1", 100)
        .attr("y1", 0)
        .attr("x2", 100)
        .attr("y2", 1500).attr("stroke-width", 2)
        .attr("stroke", "red");
    var line2 = d3.select('svg').append("line")
        .attr("x1", 0)
        .attr("y1", 100)
        .attr("x2", 1000)
        .attr("y2", 100).attr("stroke-width", 2)
        .attr("stroke", "red");
*/


