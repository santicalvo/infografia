import * as d3 from "d3";

function getArrow(svg, arrowColor = '#000000', width = 300, height = 300) {
   const arrowData = `<defs
     id="defs13268">
    <marker
       style="overflow:visible"
       id="DotL"
       refX="0.0"
       refY="0.0"
       orient="auto">
      <path
         transform="scale(0.8) translate(7.4, 1)"
         style="fill-rule:evenodd;stroke:${arrowColor};stroke-width:1pt;stroke-opacity:1;fill:${arrowColor};fill-opacity:1"
         d="M -2.5,-1.0 C -2.5,1.7600000 -4.7400000,4.0 -7.5,4.0 C -10.260000,4.0 -12.5,1.7600000 -12.5,-1.0 C -12.5,-3.7600000 -10.260000,-6.0 -7.5,-6.0 C -4.7400000,-6.0 -2.5,-3.7600000 -2.5,-1.0 z "
         id="path13882" />
    </marker>
    <marker
       style="overflow:visible"
       id="Tail"
       refX="0.0"
       refY="0.0"
       orient="auto">
      <g
         style="stroke:${arrowColor};stroke-opacity:1;fill:${arrowColor};fill-opacity:1"
         transform="scale(-1.2)"
         id="g13869">
        <path
           style="fill:${arrowColor};fill-rule:evenodd;stroke:${arrowColor};stroke-width:0.8;stroke-linecap:round;stroke-opacity:1;fill-opacity:1"
           d="M -3.8048674,-3.9585227 L 0.54352094,0"
           id="path13857" />
        <path
           style="fill:${arrowColor};fill-rule:evenodd;stroke:${arrowColor};stroke-width:0.8;stroke-linecap:round;stroke-opacity:1;fill-opacity:1"
           d="M -1.2866832,-3.9585227 L 3.0617053,0"
           id="path13859" />
        <path
           style="fill:${arrowColor};fill-rule:evenodd;stroke:${arrowColor};stroke-width:0.8;stroke-linecap:round;stroke-opacity:1;fill-opacity:1"
           d="M 1.3053582,-3.9585227 L 5.6537466,0"
           id="path13861" />
        <path
           style="fill:${arrowColor};fill-rule:evenodd;stroke:${arrowColor};stroke-width:0.8;stroke-linecap:round;stroke-opacity:1;fill-opacity:1"
           d="M -3.8048674,4.1775838 L 0.54352094,0.21974226"
           id="path13863" />
        <path
           style="fill:${arrowColor};fill-rule:evenodd;stroke:${arrowColor};stroke-width:0.8;stroke-linecap:round;stroke-opacity:1;fill-opacity:1"
           d="M -1.2866832,4.1775838 L 3.0617053,0.21974226"
           id="path13865" />
        <path
           style="fill:${arrowColor};fill-rule:evenodd;stroke:${arrowColor};stroke-width:0.8;stroke-linecap:round;stroke-opacity:1;fill-opacity:1"
           d="M 1.3053582,4.1775838 L 5.6537466,0.21974226"
           id="path13867" />
      </g>
    </marker>
    <marker
       style="overflow:visible;"
       id="Arrow2Lend"
       refX="0.0"
       refY="0.0"
       orient="auto">
      <path
         transform="scale(1.1) rotate(180) translate(1,0)"
         d="M 8.7185878,4.0337352 L -2.2072895,0.016013256 L 8.7185884,-4.0017078 C 6.9730900,-1.6296469 6.9831476,1.6157441 8.7185878,4.0337352 z "
         style="fill-rule:evenodd;stroke-width:0.625;stroke-linejoin:round;stroke:${arrowColor};stroke-opacity:1;fill:${arrowColor};fill-opacity:1"
         id="path13842" />
    </marker>
    <marker
       style="overflow:visible"
       id="Arrow2Lstart"
       refX="0.0"
       refY="0.0"
       orient="auto">
      <path
         transform="scale(1.1) translate(1,0)"
         d="M 8.7185878,4.0337352 L -2.2072895,0.016013256 L 8.7185884,-4.0017078 C 6.9730900,-1.6296469 6.9831476,1.6157441 8.7185878,4.0337352 z "
         style="fill-rule:evenodd;stroke-width:0.625;stroke-linejoin:round;stroke:${arrowColor};stroke-opacity:1;fill:${arrowColor};fill-opacity:1"
         id="path13839" />
    </marker>
  </defs>
  <g
     id="arrow_path">
    <path
       id="path14541"
       d="M 44.632797,168.37699 130.273188,42.133955"
       style="fill:none;stroke:${arrowColor};stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;marker-start:url(#DotL);marker-end:url(#Arrow2Lend)" />
  </g>`;
    try {
        if (!svg) {
            svg = d3.select("body").append("svg")
                .attr("width", width)
                .attr("height", height);
        }
        const arrow = svg.append('g').html(arrowData);
        return arrow;
    } catch (e) {
        throw Error('Unknown error generating arrow: ');
    }
}

export {getArrow};
