export default `

attribute vec2 aVertexPosition;
attribute vec2 aPlotPosition;
varying vec2 vPosition;

void main(void) {
    gl_Position = vec4(aVertexPosition, 1.0, 1.0);
    vPosition = aPlotPosition;
}

`;
