import{Et as e,R as t,bt as n,c as r,l as i}from"./webgl-device-D8_WrMMX.js";import{_ as a,a as o,c as s,d as c,f as l,g as u,h as d,i as f,l as p,m,o as h,p as g,r as _,s as v,u as y,v as b}from"./dist-D-e6hu7g.js";import{_ as x}from"./expression-DgHaZlZb.js";var ee=`transform_output`,te=class{device;model;sampler;currentIndex=0;samplerTextureMap=null;bindings=[];resources={};constructor(e,t){this.device=e,this.sampler=e.createSampler({addressModeU:`clamp-to-edge`,addressModeV:`clamp-to-edge`,minFilter:`nearest`,magFilter:`nearest`,mipmapFilter:`nearest`}),this.model=new u(this.device,{id:t.id||x(`texture-transform-model`),fs:t.fs||b({input:t.targetTextureVarying,inputChannels:t.targetTextureChannels,output:ee}),vertexCount:t.vertexCount,...t}),this._initialize(t),Object.seal(this)}destroy(){this.model.destroy();for(let e of this.bindings)e.framebuffer?.destroy()}delete(){this.destroy()}run(e){let{framebuffer:t}=this.bindings[this.currentIndex],n=this.device.beginRenderPass({framebuffer:t,...e});this.model.draw(n),n.end(),this.device.submit()}getTargetTexture(){let{targetTexture:e}=this.bindings[this.currentIndex];return e}getFramebuffer(){return this.bindings[this.currentIndex].framebuffer}_initialize(e){this._updateBindings(e)}_updateBindings(e){this.bindings[this.currentIndex]=this._updateBinding(this.bindings[this.currentIndex],e)}_updateBinding(e,{sourceBuffers:t,sourceTextures:n,targetTexture:r}){if(e||={sourceBuffers:{},sourceTextures:{},targetTexture:null},Object.assign(e.sourceTextures,n),Object.assign(e.sourceBuffers,t),r){e.targetTexture=r;let{width:t,height:n}=r;e.framebuffer&&e.framebuffer.destroy(),e.framebuffer=this.device.createFramebuffer({id:`transform-framebuffer`,width:t,height:n,colorAttachments:[r]}),e.framebuffer.resize({width:t,height:n})}return e}_setSourceTextureParameters(){let e=this.currentIndex,{sourceTextures:t}=this.bindings[e];for(let e in t)t[e].sampler=this.sampler}};function ne({pointCount:e,getBinId:t}){let n=new Map;for(let r=0;r<e;r++){let e=t(r);if(e===null)continue;let i=n.get(String(e));i?i.points.push(r):(i={id:e,index:n.size,points:[r]},n.set(String(e),i))}return Array.from(n.values())}function re({bins:e,dimensions:t,target:n}){let r=e.length*t;(!n||n.length<r)&&(n=new Float32Array(r));for(let r=0;r<e.length;r++){let{id:i}=e[r];Array.isArray(i)?n.set(i,r*t):n[r]=i}return n}var ie=e=>e.length,ae=(e,t)=>{let n=0;for(let r of e)n+=t(r);return n},oe={COUNT:ie,SUM:ae,MEAN:(e,t)=>e.length===0?NaN:ae(e,t)/e.length,MIN:(e,t)=>{let n=1/0;for(let r of e){let e=t(r);e<n&&(n=e)}return n},MAX:(e,t)=>{let n=-1/0;for(let r of e){let e=t(r);e>n&&(n=e)}return n}};function se({bins:e,getValue:t,operation:n,target:r}){(!r||r.length<e.length)&&(r=new Float32Array(e.length));let i=1/0,a=-1/0;for(let o=0;o<e.length;o++){let{points:s}=e[o];r[o]=n(s,t),r[o]<i&&(i=r[o]),r[o]>a&&(a=r[o])}return{value:r,domain:[i,a]}}function ce(e,t,n){let r={};for(let n of e.sources||[]){let e=t[n];if(e)r[n]=le(e);else throw Error(`Cannot find attribute ${n}`)}let i={};return t=>{for(let e in r)i[e]=r[e](t);return e.getValue(i,t,n)}}function le(e){let t=e.value,{offset:n=0,stride:r,size:i}=e.getAccessor(),a=t.BYTES_PER_ELEMENT,o=n/a,s=r?r/a:i;if(i===1)return e.isConstant?()=>t[0]:e=>{let n=o+s*e;return t[n]};let c;return e.isConstant?(c=Array.from(t),()=>c):(c=Array(i),e=>{let n=o+s*e;for(let e=0;e<i;e++)c[e]=t[n+e];return c})}var S=class{constructor(e){this.bins=[],this.binIds=null,this.results=[],this.dimensions=e.dimensions,this.channelCount=e.getValue.length,this.props={...e,binOptions:{},pointCount:0,operations:[],customOperations:[],attributes:{}},this.needsUpdate=!0,this.setProps(e)}destroy(){}get binCount(){return this.bins.length}setProps(e){let t=this.props;if(e.binOptions&&(r(e.binOptions,t.binOptions,2)||this.setNeedsUpdate()),e.operations)for(let n=0;n<this.channelCount;n++)e.operations[n]!==t.operations[n]&&this.setNeedsUpdate(n);if(e.customOperations)for(let n=0;n<this.channelCount;n++)!!e.customOperations[n]!=!!t.customOperations[n]&&this.setNeedsUpdate(n);e.pointCount!==void 0&&e.pointCount!==t.pointCount&&this.setNeedsUpdate(),e.attributes&&={...t.attributes,...e.attributes},Object.assign(this.props,e)}setNeedsUpdate(e){e===void 0?this.needsUpdate=!0:this.needsUpdate!==!0&&(this.needsUpdate=this.needsUpdate||[],this.needsUpdate[e]=!0)}update(){if(this.needsUpdate===!0){this.bins=ne({pointCount:this.props.pointCount,getBinId:ce(this.props.getBin,this.props.attributes,this.props.binOptions)});let e=re({bins:this.bins,dimensions:this.dimensions,target:this.binIds?.value});this.binIds={value:e,type:`float32`,size:this.dimensions}}for(let e=0;e<this.channelCount;e++)if(this.needsUpdate===!0||this.needsUpdate[e]){let t=this.props.customOperations[e]||oe[this.props.operations[e]],{value:n,domain:r}=se({bins:this.bins,getValue:ce(this.props.getValue[e],this.props.attributes,void 0),operation:t,target:this.results[e]?.value});this.results[e]={value:n,domain:r,type:`float32`,size:1},this.props.onUpdate?.({channel:e})}this.needsUpdate=!1}preDraw(){}getBins(){return this.binIds}getResult(e){return this.results[e]}getResultDomain(e){return this.results[e]?.domain??[1/0,-1/0]}getBin(e){let t=this.bins[e];if(!t)return null;let n=Array(this.channelCount);for(let t=0;t<n.length;t++){let r=this.results[t];n[t]=r?.value[e]}return{id:t.id,value:n,count:t.points.length,pointIndices:t.points}}};function ue(e,t,n){return e.createFramebuffer({width:t,height:n,colorAttachments:[e.createTexture({width:t,height:n,format:`rgba32float`,sampler:{minFilter:`nearest`,magFilter:`nearest`}})]})}var de={name:`binSorter`,vs:`layout(std140) uniform binSorterUniforms {
  ivec4 binIdRange;
  ivec2 targetSize;
} binSorter;
`,uniformTypes:{binIdRange:`vec4<i32>`,targetSize:`vec2<i32>`}},fe=[1,2,4,8],pe=3e38,me={SUM:0,MEAN:0,MIN:0,MAX:0,COUNT:0},C=1024,he=class{constructor(e,t){this.binsFBO=null,this.device=e,this.model=_e(e,t)}get texture(){return this.binsFBO?this.binsFBO.colorAttachments[0].texture:null}destroy(){this.model.destroy(),this.binsFBO?.colorAttachments[0].texture.destroy(),this.binsFBO?.destroy()}getBinValues(e){if(!this.binsFBO)return null;let t=e%C,n=Math.floor(e/C),r=this.device.readPixelsToArrayWebGL(this.binsFBO,{sourceX:t,sourceY:n,sourceWidth:1,sourceHeight:1}).buffer;return new Float32Array(r)}setDimensions(e,t){let n=C,r=Math.ceil(e/n);this.binsFBO?this.binsFBO.height<r&&this.binsFBO.resize({width:n,height:r}):this.binsFBO=ue(this.device,n,r);let i={binIdRange:[t[0][0],t[0][1],t[1]?.[0]||0,t[1]?.[1]||0],targetSize:[this.binsFBO.width,this.binsFBO.height]};this.model.shaderInputs.setProps({binSorter:i})}setModelProps(e){let t=this.model;e.attributes&&t.setAttributes(e.attributes),e.constantAttributes&&t.setConstantAttributes(e.constantAttributes),e.vertexCount!==void 0&&t.setVertexCount(e.vertexCount),e.shaderModuleProps&&t.shaderInputs.setProps(e.shaderModuleProps)}update(e){if(!this.binsFBO)return;let t=ge(e);this._updateBins(`SUM`,t.SUM+t.MEAN),this._updateBins(`MIN`,t.MIN),this._updateBins(`MAX`,t.MAX)}_updateBins(e,t){if(t===0)return;t|=fe[3];let n=this.model,r=this.binsFBO,i=e===`MAX`?-3e38:e===`MIN`?pe:0,a=this.device.beginRenderPass({id:`gpu-aggregation-${e}`,framebuffer:r,parameters:{viewport:[0,0,r.width,r.height],colorMask:t},clearColor:[i,i,i,0],clearDepth:!1,clearStencil:!1});n.setParameters({blend:!0,blendColorSrcFactor:`one`,blendColorDstFactor:`one`,blendAlphaSrcFactor:`one`,blendAlphaDstFactor:`one`,blendColorOperation:e===`MAX`?`max`:e===`MIN`?`min`:`add`,blendAlphaOperation:`add`}),n.draw(a),a.end()}};function ge(e){let t={...me};for(let n=0;n<e.length;n++){let r=e[n];r&&(t[r]+=fe[n])}return t}function _e(e,t){let n=t.vs;t.dimensions===2&&(n+=`
void getBin(out int binId) {
  ivec2 binId2;
  getBin(binId2);
  if (binId2.x < binSorter.binIdRange.x || binId2.x >= binSorter.binIdRange.y) {
    binId = -1;
  } else {
    binId = (binId2.y - binSorter.binIdRange.z) * (binSorter.binIdRange.y - binSorter.binIdRange.x) + binId2.x;
  }
}
`);let r=`\
#version 300 es
#define SHADER_NAME gpu-aggregation-sort-bins-vertex

${n}

out vec3 v_Value;

void main() {
  int binIndex;
  getBin(binIndex);
  binIndex = binIndex - binSorter.binIdRange.x;
  if (binIndex < 0) {
    gl_Position = vec4(0.);
    return;
  }
  int row = binIndex / binSorter.targetSize.x;
  int col = binIndex - row * binSorter.targetSize.x;
  vec2 position = (vec2(col, row) + 0.5) / vec2(binSorter.targetSize) * 2.0 - 1.0;
  gl_Position = vec4(position, 0.0, 1.0);
  gl_PointSize = 1.0;

#if NUM_CHANNELS == 3
  getValue(v_Value);
#elif NUM_CHANNELS == 2
  getValue(v_Value.xy);
#else
  getValue(v_Value.x);
#endif
}
`;return new u(e,{bufferLayout:t.bufferLayout,modules:[...t.modules||[],de],defines:{...t.defines,NON_INSTANCED_MODEL:1,NUM_CHANNELS:t.channelCount},isInstanced:!1,vs:r,fs:`#version 300 es
#define SHADER_NAME gpu-aggregation-sort-bins-fragment

precision highp float;

in vec3 v_Value;
out vec4 fragColor;

void main() {
  fragColor.xyz = v_Value;

  #ifdef MODULE_GEOMETRY
  geometry.uv = vec2(0.);
  DECKGL_FILTER_COLOR(fragColor, geometry);
  #endif

  fragColor.w = 1.0;
}
`,topology:`point-list`,disableWarnings:!0})}var ve={name:`aggregatorTransform`,vs:`layout(std140) uniform aggregatorTransformUniforms {
  ivec4 binIdRange;
  bvec3 isCount;
  bvec3 isMean;
  float naN;
} aggregatorTransform;
`,uniformTypes:{binIdRange:`vec4<i32>`,isCount:`vec3<f32>`,isMean:`vec3<f32>`,naN:`f32`}},ye=class{constructor(e,t){this.binBuffer=null,this.valueBuffer=null,this._domains=null,this.device=e,this.channelCount=t.channelCount,this.transform=be(e,t),this.domainFBO=ue(e,2,1)}destroy(){this.transform.destroy(),this.binBuffer?.destroy(),this.valueBuffer?.destroy(),this.domainFBO.colorAttachments[0].texture.destroy(),this.domainFBO.destroy()}get domains(){if(!this._domains){let e=this.device.readPixelsToArrayWebGL(this.domainFBO).buffer,t=new Float32Array(e);this._domains=[[-t[4],t[0]],[-t[5],t[1]],[-t[6],t[2]]].slice(0,this.channelCount)}return this._domains}setDimensions(e,t){let{model:n,transformFeedback:r}=this.transform;n.setVertexCount(e);let i={binIdRange:[t[0][0],t[0][1],t[1]?.[0]||0,t[1]?.[1]||0]};n.shaderInputs.setProps({aggregatorTransform:i});let a=e*t.length*4;(!this.binBuffer||this.binBuffer.byteLength<a)&&(this.binBuffer?.destroy(),this.binBuffer=this.device.createBuffer({byteLength:a}),r.setBuffer(`binIds`,this.binBuffer));let o=e*this.channelCount*4;(!this.valueBuffer||this.valueBuffer.byteLength<o)&&(this.valueBuffer?.destroy(),this.valueBuffer=this.device.createBuffer({byteLength:o}),r.setBuffer(`values`,this.valueBuffer))}update(e,t){if(!e)return;let n=this.transform,r=this.domainFBO,i={isCount:[0,1,2].map(e=>+(t[e]===`COUNT`)),isMean:[0,1,2].map(e=>+(t[e]===`MEAN`)),bins:e};n.model.shaderInputs.setProps({aggregatorTransform:i}),n.run({id:`gpu-aggregation-domain`,framebuffer:r,discard:!1,parameters:{viewport:[0,0,2,1]},clearColor:[-3e38,-3e38,-3e38,0],clearDepth:!1,clearStencil:!1}),this._domains=null}};function be(e,t){return e.type===`webgl`&&e.getExtension(`GL_ARB_shader_bit_encoding`),new d(e,{vs:`#version 300 es
#define SHADER_NAME gpu-aggregation-domain-vertex

uniform sampler2D bins;

#if NUM_DIMS == 1
out float binIds;
#else
out vec2 binIds;
#endif

#if NUM_CHANNELS == 1
flat out float values;
#elif NUM_CHANNELS == 2
flat out vec2 values;
#else
flat out vec3 values;
#endif

const float NAN = intBitsToFloat(-1);

void main() {
  int row = gl_VertexID / SAMPLER_WIDTH;
  int col = gl_VertexID - row * SAMPLER_WIDTH;
  vec4 weights = texelFetch(bins, ivec2(col, row), 0);
  vec3 value3 = mix(
    mix(weights.rgb, vec3(weights.a), aggregatorTransform.isCount),
    weights.rgb / max(weights.a, 1.0),
    aggregatorTransform.isMean
  );
  if (weights.a == 0.0) {
    value3 = vec3(NAN);
  }

#if NUM_DIMS == 1
  binIds = float(gl_VertexID + aggregatorTransform.binIdRange.x);
#else
  int y = gl_VertexID / (aggregatorTransform.binIdRange.y - aggregatorTransform.binIdRange.x);
  int x = gl_VertexID - y * (aggregatorTransform.binIdRange.y - aggregatorTransform.binIdRange.x);
  binIds.y = float(y + aggregatorTransform.binIdRange.z);
  binIds.x = float(x + aggregatorTransform.binIdRange.x);
#endif

#if NUM_CHANNELS == 3
  values = value3;
#elif NUM_CHANNELS == 2
  values = value3.xy;
#else
  values = value3.x;
#endif

  gl_Position = vec4(0., 0., 0., 1.);
  // This model renders into a 2x1 texture to obtain min and max simultaneously.
  // See comments in fragment shader
  gl_PointSize = 2.0;
}
`,fs:`#version 300 es
#define SHADER_NAME gpu-aggregation-domain-fragment

precision highp float;

#if NUM_CHANNELS == 1
flat in float values;
#elif NUM_CHANNELS == 2
flat in vec2 values;
#else
flat in vec3 values;
#endif

out vec4 fragColor;

void main() {
  vec3 value3;
#if NUM_CHANNELS == 3
  value3 = values;
#elif NUM_CHANNELS == 2
  value3.xy = values;
#else
  value3.x = values;
#endif
  if (isnan(value3.x)) discard;
  // This shader renders into a 2x1 texture with blending=max
  // The left pixel yields the max value of each channel
  // The right pixel yields the min value of each channel
  if (gl_FragCoord.x < 1.0) {
    fragColor = vec4(value3, 1.0);
  } else {
    fragColor = vec4(-value3, 1.0);
  }
}
`,topology:`point-list`,modules:[ve],parameters:{blend:!0,blendColorSrcFactor:`one`,blendColorDstFactor:`one`,blendColorOperation:`max`,blendAlphaSrcFactor:`one`,blendAlphaDstFactor:`one`,blendAlphaOperation:`max`},defines:{NUM_DIMS:t.dimensions,NUM_CHANNELS:t.channelCount,SAMPLER_WIDTH:C},varyings:[`binIds`,`values`],disableWarnings:!0})}var w=class{static isSupported(e){return e.features.has(`float32-renderable-webgl`)&&e.features.has(`texture-blend-float-webgl`)}constructor(e,t){this.binCount=0,this.binIds=null,this.results=[],this.device=e,this.dimensions=t.dimensions,this.channelCount=t.channelCount,this.props={...t,pointCount:0,binIdRange:[[0,0]],operations:[],attributes:{},binOptions:{}},this.needsUpdate=Array(this.channelCount).fill(!0),this.binSorter=new he(e,t),this.aggregationTransform=new ye(e,t),this.setProps(t)}getBins(){let e=this.aggregationTransform.binBuffer;return e?(this.binIds?.buffer!==e&&(this.binIds={buffer:e,type:`float32`,size:this.dimensions}),this.binIds):null}getResult(e){let t=this.aggregationTransform.valueBuffer;return!t||e>=this.channelCount?null:(this.results[e]?.buffer!==t&&(this.results[e]={buffer:t,type:`float32`,size:1,stride:this.channelCount*4,offset:e*4}),this.results[e])}getResultDomain(e){return this.aggregationTransform.domains[e]}getBin(e){if(e<0||e>=this.binCount)return null;let{binIdRange:t}=this.props,n;if(this.dimensions===1)n=[e+t[0][0]];else{let[[r,i],[a]]=t,o=i-r;n=[e%o+r,Math.floor(e/o)+a]}let r=this.binSorter.getBinValues(e);if(!r)return null;let i=r[3],a=[];for(let e=0;e<this.channelCount;e++){let t=this.props.operations[e];t===`COUNT`?a[e]=i:i===0?a[e]=NaN:a[e]=t===`MEAN`?r[e]/i:r[e]}return{id:n,value:a,count:i}}destroy(){this.binSorter.destroy(),this.aggregationTransform.destroy()}setProps(t){let n=this.props;if(`binIdRange`in t&&!r(t.binIdRange,n.binIdRange,2)){let n=t.binIdRange;if(e.assert(n.length===this.dimensions),this.dimensions===1){let[[e,t]]=n;this.binCount=t-e}else{let[[e,t],[r,i]]=n;this.binCount=(t-e)*(i-r)}this.binSorter.setDimensions(this.binCount,n),this.aggregationTransform.setDimensions(this.binCount,n),this.setNeedsUpdate()}if(t.operations)for(let e=0;e<this.channelCount;e++)t.operations[e]!==n.operations[e]&&this.setNeedsUpdate(e);if(t.pointCount!==void 0&&t.pointCount!==n.pointCount&&(this.binSorter.setModelProps({vertexCount:t.pointCount}),this.setNeedsUpdate()),t.binOptions&&(r(t.binOptions,n.binOptions,2)||this.setNeedsUpdate(),this.binSorter.model.shaderInputs.setProps({binOptions:t.binOptions})),t.attributes){let e={},n={};for(let r of Object.values(t.attributes))for(let[t,i]of Object.entries(r.getValue()))ArrayBuffer.isView(i)?n[t]=i:i&&(e[t]=i);this.binSorter.setModelProps({attributes:e,constantAttributes:n})}t.shaderModuleProps&&this.binSorter.setModelProps({shaderModuleProps:t.shaderModuleProps}),Object.assign(this.props,t)}setNeedsUpdate(e){e===void 0?this.needsUpdate.fill(!0):this.needsUpdate[e]=!0}update(){}preDraw(){if(!this.needsUpdate.some(Boolean))return;let{operations:e}=this.props,t=this.needsUpdate.map((t,n)=>t?e[n]:null);this.binSorter.update(t),this.aggregationTransform.update(this.binSorter.texture,e);for(let e=0;e<this.channelCount;e++)this.needsUpdate[e]&&(this.needsUpdate[e]=!1,this.props.onUpdate?.({channel:e}))}},T=class extends h{get isDrawable(){return!0}initializeState(){}updateState(e){super.updateState(e);let t=this.getAggregatorType();if(e.changeFlags.extensionsChanged||this.state.aggregatorType!==t){this.state.aggregator?.destroy();let e=this.createAggregator(t);return e.setProps({attributes:this.getAttributeManager()?.attributes}),this.setState({aggregator:e,aggregatorType:t}),!0}return!1}finalizeState(e){super.finalizeState(e),this.state.aggregator.destroy()}updateAttributes(e){let{aggregator:t}=this.state;t.setProps({attributes:e});for(let t in e)this.onAttributeChange(t);t.update()}draw({shaderModuleProps:e}){let{aggregator:t}=this.state;t.setProps({shaderModuleProps:e}),t.preDraw()}_getAttributeManager(){return new p(this.context.device,{id:this.props.id,stats:this.context.stats})}};T.layerName=`AggregationLayer`;var E=[[255,255,178],[254,217,118],[254,178,76],[253,141,60],[240,59,32],[189,0,38]];function xe(e,t=!1,n=Float32Array){let r;if(Number.isFinite(e[0]))r=new n(e);else{r=new n(e.length*4);let t=0;for(let n=0;n<e.length;n++){let i=e[n];r[t++]=i[0],r[t++]=i[1],r[t++]=i[2],r[t++]=Number.isFinite(i[3])?i[3]:255}}if(t)for(let e=0;e<r.length;e++)r[e]/=255;return r}var D={linear:`linear`,quantile:`nearest`,quantize:`nearest`,ordinal:`nearest`};function O(e,t){e.setSampler({minFilter:D[t],magFilter:D[t]})}function k(e,t,n=`linear`){let r=xe(t,!1,Uint8Array);return e.createTexture({format:`rgba8unorm`,sampler:{minFilter:D[n],magFilter:D[n],addressModeU:`clamp-to-edge`,addressModeV:`clamp-to-edge`},data:r,width:r.length/4,height:1})}var Se=`
struct Attributes {
  @builtin(instance_index) instanceIndex: u32,
  @location(0) positions: vec2<f32>,
  @location(1) instancePositions: vec2<f32>,
  @location(2) instanceWeights: f32,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) pickingColor: vec3<f32>,
};

fn sampleColorRange(value: f32, domain: vec2<f32>) -> vec4<f32> {
  let ratio = (value - domain.x) / (domain.y - domain.x);
  return textureSampleLevel(colorRange, colorRangeSampler, vec2<f32>(ratio, 0.5), 0.0);
}

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var output: Varyings;
  output.pickingColor = picking_getPickingColorFromIndex(attributes.instanceIndex);

  if (attributes.instanceWeights != attributes.instanceWeights) {
    output.position = vec4<f32>(0.0);
    output.color = vec4<f32>(0.0);
    return output;
  }

  var position =
    attributes.instancePositions * screenGrid.gridSizeClipspace +
    attributes.positions * screenGrid.cellSizeClipspace;
  position.x -= 1.0;
  position.y = 1.0 - position.y;

  output.position = vec4<f32>(position, 0.0, 1.0);
  let colorValue = sampleColorRange(attributes.instanceWeights, screenGrid.colorDomain);
  output.color = vec4<f32>(colorValue.rgb, colorValue.a * layer.opacity);
  return output;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(varyings.pickingColor)) {
      discard;
    }
    return vec4<f32>(varyings.pickingColor, 1.0);
  }

  var color = varyings.color;
  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(varyings.pickingColor - highlightedObjectColor))) {
      let highLightAlpha = picking.highlightColor.a;
      let blendedAlpha = highLightAlpha + color.a * (1.0 - highLightAlpha);
      if (blendedAlpha > 0.0) {
        let highLightRatio = highLightAlpha / blendedAlpha;
        color = vec4<f32>(
          mix(color.rgb, picking.highlightColor.rgb, highLightRatio),
          blendedAlpha
        );
      } else {
        color = vec4<f32>(color.rgb, 0.0);
      }
    }
  }

  return deckgl_premultiplied_alpha(color);
}
`,Ce=`#version 300 es
#define SHADER_NAME screen-grid-layer-vertex-shader
#define RANGE_COUNT 6
in vec2 positions;
in vec2 instancePositions;
in float instanceWeights;
uniform sampler2D colorRange;
out vec4 vColor;
vec4 interp(float value, vec2 domain, sampler2D range) {
float r = (value - domain.x) / (domain.y - domain.x);
return texture(range, vec2(r, 0.5));
}
void main(void) {
if (isnan(instanceWeights)) {
gl_Position = vec4(0.);
return;
}
vec2 pos = instancePositions * screenGrid.gridSizeClipspace + positions * screenGrid.cellSizeClipspace;
pos.x = pos.x - 1.0;
pos.y = 1.0 - pos.y;
gl_Position = vec4(pos, 0., 1.);
vColor = interp(instanceWeights, screenGrid.colorDomain, colorRange);
vColor.a *= layer.opacity;
picking_setPickingColorFromInstanceID();
}
`,we=`#version 300 es
#define SHADER_NAME screen-grid-layer-fragment-shader
precision highp float;
in vec4 vColor;
out vec4 fragColor;
void main(void) {
fragColor = vColor;
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,Te={name:`screenGrid`,source:`
struct ScreenGridUniforms {
  cellSizeClipspace: vec2<f32>,
  gridSizeClipspace: vec2<f32>,
  colorDomain: vec2<f32>,
};

@group(0) @binding(auto) var<uniform> screenGrid: ScreenGridUniforms;
@group(0) @binding(auto) var colorRange: texture_2d<f32>;
@group(0) @binding(auto) var colorRangeSampler: sampler;
`,vs:`layout(std140) uniform screenGridUniforms {
  vec2 cellSizeClipspace;
  vec2 gridSizeClipspace;
  vec2 colorDomain;
} screenGrid;
`,uniformTypes:{cellSizeClipspace:`vec2<f32>`,gridSizeClipspace:`vec2<f32>`,colorDomain:`vec2<f32>`}},Ee=class extends v{getShaders(){return super.getShaders({source:Se,vs:Ce,fs:we,modules:[g,c,Te]})}initializeState(){this.getAttributeManager().addInstanced({instancePositions:{size:2,type:`float32`,accessor:`getBin`},instanceWeights:{size:1,type:`float32`,accessor:`getWeight`}}),this.state.model=this._getModel()}updateState(e){super.updateState(e);let{props:t,oldProps:n,changeFlags:r}=e,i=this.state.model;if(n.colorRange!==t.colorRange){this.state.colorTexture?.destroy(),this.state.colorTexture=k(this.context.device,t.colorRange,t.colorScaleType);let e={colorRange:this.state.colorTexture};i.shaderInputs.setProps({screenGrid:e})}else n.colorScaleType!==t.colorScaleType&&O(this.state.colorTexture,t.colorScaleType);if(n.cellMarginPixels!==t.cellMarginPixels||n.cellSizePixels!==t.cellSizePixels||r.viewportChanged){let{width:e,height:t}=this.context.viewport,{cellSizePixels:n,cellMarginPixels:r}=this.props,a=Math.max(n-r,0),o={gridSizeClipspace:[n/e*2,n/t*2],cellSizeClipspace:[a/e*2,a/t*2]};i.shaderInputs.setProps({screenGrid:o})}}finalizeState(e){super.finalizeState(e),this.state.colorTexture?.destroy()}draw({uniforms:e}){let t=this.props.colorDomain(),n=this.state.model,r={colorDomain:t};n.shaderInputs.setProps({screenGrid:r}),n.draw(this.context.renderPass)}_getModel(){return new u(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new a({topology:`triangle-strip`,attributes:{positions:{value:new Float32Array([0,0,1,0,0,1,1,1]),size:2}}}),isInstanced:!0})}};Ee.layerName=`ScreenGridCellLayer`;var De={name:`binOptions`,vs:`layout(std140) uniform binOptionsUniforms {
  float cellSizePixels;
} binOptions;
`,uniformTypes:{cellSizePixels:`f32`}},Oe={cellSizePixels:{type:`number`,value:100,min:1},cellMarginPixels:{type:`number`,value:2,min:0},colorRange:E,colorScaleType:`linear`,getPosition:{type:`accessor`,value:e=>e.position},getWeight:{type:`accessor`,value:1},gpuAggregation:!0,aggregation:`SUM`},ke=class extends T{getAggregatorType(){return this.props.gpuAggregation&&w.isSupported(this.context.device)?`gpu`:`cpu`}createAggregator(e){return e===`cpu`||!w.isSupported(this.context.device)?new S({dimensions:2,getBin:{sources:[`positions`],getValue:({positions:e},t,n)=>{let r=this.context.viewport,i=r.project(e),a=n.cellSizePixels;return i[0]<0||i[0]>=r.width||i[1]<0||i[1]>=r.height?null:[Math.floor(i[0]/a),Math.floor(i[1]/a)]}},getValue:[{sources:[`counts`],getValue:({counts:e})=>e}]}):new w(this.context.device,{dimensions:2,channelCount:1,bufferLayout:this.getAttributeManager().getBufferLayouts({isInstanced:!1}),...super.getShaders({modules:[l,De],vs:`
  in vec3 positions;
  in vec3 positions64Low;
  in float counts;
  
  void getBin(out ivec2 binId) {
    vec4 pos = project_position_to_clipspace(positions, positions64Low, vec3(0.0));
    vec2 screenCoords = vec2(pos.x / pos.w + 1.0, 1.0 - pos.y / pos.w) / 2.0 * project.viewportSize.xy / project.devicePixelRatio;
    vec2 gridCoords = floor(screenCoords / binOptions.cellSizePixels);
    binId = ivec2(gridCoords);
  }
  void getValue(out float weight) {
    weight = counts;
  }
  `})})}initializeState(){super.initializeState(),this.getAttributeManager().add({positions:{size:3,accessor:`getPosition`,type:`float64`,fp64:this.use64bitPositions()},counts:{size:1,accessor:`getWeight`}})}shouldUpdateState({changeFlags:e}){return e.somethingChanged}updateState(e){let t=super.updateState(e),{props:n,oldProps:r,changeFlags:i}=e,{cellSizePixels:a,aggregation:o}=n;if(t||i.dataChanged||i.updateTriggersChanged||i.viewportChanged||o!==r.aggregation||a!==r.cellSizePixels){let{width:e,height:t}=this.context.viewport,{aggregator:n}=this.state;n instanceof w&&n.setProps({binIdRange:[[0,Math.ceil(e/a)],[0,Math.ceil(t/a)]]}),n.setProps({pointCount:this.getNumInstances(),operations:[o],binOptions:{cellSizePixels:a}})}return i.viewportChanged&&this.state.aggregator.setNeedsUpdate(),t}onAttributeChange(e){let{aggregator:t}=this.state;switch(e){case`positions`:t.setNeedsUpdate();break;case`counts`:t.setNeedsUpdate(0)}}renderLayers(){let{aggregator:e}=this.state,t=this.getSubLayerClass(`cells`,Ee),n=e.getBins(),r=e.getResult(0);return new t(this.props,this.getSubLayerProps({id:`cell-layer`}),{data:{length:e.binCount,attributes:{getBin:n,getWeight:r}},dataComparator:(e,t)=>e.length===t.length,updateTriggers:{getBin:[n],getWeight:[r]},parameters:{depthWriteEnabled:!1,...this.props.parameters},colorDomain:()=>this.props.colorDomain||e.getResultDomain(0),extensions:[]})}getPickingInfo(e){let t=e.info,{index:n}=t;if(n>=0){let e=this.state.aggregator.getBin(n),r;e&&(r={col:e.id[0],row:e.id[1],value:e.value[0],count:e.count},e.pointIndices&&(r.pointIndices=e.pointIndices,r.points=Array.isArray(this.props.data)?e.pointIndices.map(e=>this.props.data[e]):[])),t.object=r}return t}};ke.layerName=`ScreenGridLayer`,ke.defaultProps=Oe;var A=class{constructor(e,t){this.props={scaleType:`linear`,lowerPercentile:0,upperPercentile:100},this.domain=null,this.cutoff=null,this.input=e,this.inputLength=t,this.attribute=e}getScalePercentile(){if(!this._percentile){let e=Me(this.input,this.inputLength);this._percentile=je(e)}return this._percentile}getScaleOrdinal(){if(!this._ordinal){let e=Me(this.input,this.inputLength);this._ordinal=Ae(e)}return this._ordinal}getCutoff({scaleType:e,lowerPercentile:t,upperPercentile:n}){if(e===`quantile`)return[t,n-1];if(t>0||n<100){let{domain:r}=this.getScalePercentile(),i=r[Math.floor(t)-1]??-1/0,a=r[Math.floor(n)-1]??1/0;if(e===`ordinal`){let{domain:e}=this.getScaleOrdinal();i=e.findIndex(e=>e>=i),a=e.findIndex(e=>e>a)-1,a===-2&&(a=e.length-1)}return[i,a]}return null}update(e){let t=this.props;if(e.scaleType!==t.scaleType)switch(e.scaleType){case`quantile`:{let{attribute:e}=this.getScalePercentile();this.attribute=e,this.domain=[0,99];break}case`ordinal`:{let{attribute:e,domain:t}=this.getScaleOrdinal();this.attribute=e,this.domain=[0,t.length-1];break}default:this.attribute=this.input,this.domain=null}return(e.scaleType!==t.scaleType||e.lowerPercentile!==t.lowerPercentile||e.upperPercentile!==t.upperPercentile)&&(this.cutoff=this.getCutoff(e)),this.props=e,this}};function Ae(e){let t=new Set;for(let n of e)Number.isFinite(n)&&t.add(n);let n=Array.from(t).sort(),r=new Map;for(let e=0;e<n.length;e++)r.set(n[e],e);return{attribute:{value:e.map(e=>Number.isFinite(e)?r.get(e):NaN),type:`float32`,size:1},domain:n}}function je(e,t=100){let n=Array.from(e).filter(Number.isFinite).sort(Ne),r=0,i=Math.max(1,t),a=Array(i-1);for(;++r<i;)a[r-1]=Pe(n,r/i);return{attribute:{value:e.map(e=>Number.isFinite(e)?Fe(a,e):NaN),type:`float32`,size:1},domain:a}}function Me(e,t){let n=(e.stride??4)/4,r=(e.offset??0)/4,i=e.value;if(!i){let r=e.buffer?.readSyncWebGL(0,n*4*t);r&&(i=new Float32Array(r.buffer),e.value=i)}if(n===1)return i.subarray(0,t);let a=new Float32Array(t);for(let e=0;e<t;e++)a[e]=i[e*n+r];return a}function Ne(e,t){return e-t}function Pe(e,t){let n=e.length;if(t<=0||n<2)return e[0];if(t>=1)return e[n-1];let r=(n-1)*t,i=Math.floor(r),a=e[i];return a+(e[i+1]-a)*(r-i)}function Fe(e,t){let n=0,r=e.length;for(;n<r;){let i=n+r>>>1;e[i]>t?r=i:n=i+1}return n}function Ie({dataBounds:e,getBinId:t,padding:n=0}){let r=[e[0],e[1],[e[0][0],e[1][1]],[e[1][0],e[0][1]]].map(e=>t(e)),i=Math.min(...r.map(e=>e[0]))-n,a=Math.min(...r.map(e=>e[1]))-n,o=Math.max(...r.map(e=>e[0]))+n+1,s=Math.max(...r.map(e=>e[1]))+n+1;return[[i,o],[a,s]]}var Le=`const HEXBIN_DISTANCE: vec2<f32> = vec2<f32>(1.7320508, 1.5);

struct Attributes {
  @builtin(instance_index) instanceIndex: u32,
  @location(0) positions: vec3<f32>,
  @location(1) normals: vec3<f32>,
  @location(2) instancePositions: vec2<f32>,
  @location(3) instanceColorValues: f32,
  @location(4) instanceElevationValues: f32,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) pickingColor: vec3<f32>,
};

fn hexbinCentroid(binId: vec2<f32>, radius: f32) -> vec2<f32> {
  var adjustedBinId = binId;
  adjustedBinId.x += fract(adjustedBinId.y * 0.5);
  return adjustedBinId * HEXBIN_DISTANCE * radius;
}

fn interpolate(value: f32, domain: vec2<f32>, range: vec2<f32>) -> f32 {
  let ratio = clamp((value - domain.x) / (domain.y - domain.x), 0.0, 1.0);
  return mix(range.x, range.y, ratio);
}

fn sampleColorRange(value: f32, domain: vec2<f32>) -> vec4<f32> {
  let ratio = (value - domain.x) / (domain.y - domain.x);
  return textureSampleLevel(colorRange, colorRangeSampler, vec2<f32>(ratio, 0.5), 0.0);
}

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var output: Varyings;
  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.instanceIndex);
  output.pickingColor = geometry.pickingColor;

  if (
    attributes.instanceColorValues != attributes.instanceColorValues ||
    attributes.instanceColorValues < hexagon.colorDomain.z ||
    attributes.instanceColorValues > hexagon.colorDomain.w ||
    attributes.instanceElevationValues < hexagon.elevationDomain.z ||
    attributes.instanceElevationValues > hexagon.elevationDomain.w
  ) {
    output.position = vec4<f32>(0.0);
    output.color = vec4<f32>(0.0);
    return output;
  }

  var commonPosition =
    hexbinCentroid(attributes.instancePositions, column.radius) +
    (hexagon.originCommon - project.commonOrigin.xy);
  commonPosition += attributes.positions.xy * column.radius * column.coverage;
  geometry.position = vec4<f32>(commonPosition, 0.0, 1.0);
  geometry.normal = project_normal(attributes.normals);

  if (column.extruded > 0.5) {
    var elevation = interpolate(
      attributes.instanceElevationValues,
      hexagon.elevationDomain.xy,
      hexagon.elevationRange
    );
    elevation = project_size_float(elevation);
    geometry.position.z = (attributes.positions.z + 1.0) / 2.0 * elevation;
  }

  output.position = project_common_position_to_clipspace(geometry.position);
  var colorValue = sampleColorRange(attributes.instanceColorValues, hexagon.colorDomain.xy);
  if (column.extruded > 0.5) {
    colorValue = vec4<f32>(
      lighting_getLightColor2(
        colorValue.rgb,
        project.cameraPosition,
        geometry.position.xyz,
        geometry.normal
      ),
      colorValue.a
    );
  }
  output.color = vec4<f32>(colorValue.rgb, colorValue.a * layer.opacity);
  return output;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(varyings.pickingColor)) {
      discard;
    }
    return vec4<f32>(varyings.pickingColor, 1.0);
  }

  var color = varyings.color;
  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(varyings.pickingColor - highlightedObjectColor))) {
      let highLightAlpha = picking.highlightColor.a;
      let blendedAlpha = highLightAlpha + color.a * (1.0 - highLightAlpha);
      if (blendedAlpha > 0.0) {
        let highLightRatio = highLightAlpha / blendedAlpha;
        color = vec4<f32>(
          mix(color.rgb, picking.highlightColor.rgb, highLightRatio),
          blendedAlpha
        );
      } else {
        color = vec4<f32>(color.rgb, 0.0);
      }
    }
  }

  return deckgl_premultiplied_alpha(color);
}
`,Re=Math.PI/3,j=2*Math.sin(Re),M=1.5,ze=Array.from({length:6},(e,t)=>{let n=t*Re;return[Math.sin(n),-Math.cos(n)]});function N([e,t],n){let r=Math.round(t=t/n/M),i=Math.round(e=e/n/j-(r&1)/2),a=t-r;if(Math.abs(a)*3>1){let n=e-i,o=i+(e<i?-1:1)/2,s=r+(t<r?-1:1),c=e-o,l=t-s;n*n+a*a>c*c+l*l&&(i=o+(r&1?1:-1)/2,r=s)}return[i,r]}var Be=`
const vec2 DIST = vec2(${j}, ${M});

ivec2 pointToHexbin(vec2 p, float radius) {
  p /= radius * DIST;
  float pj = round(p.y);
  float pjm2 = mod(pj, 2.0);
  p.x -= pjm2 * 0.5;
  float pi = round(p.x);
  vec2 d1 = p - vec2(pi, pj);

  if (abs(d1.y) * 3. > 1.) {
    vec2 v2 = step(0.0, d1) - 0.5;
    v2.y *= 2.0;
    vec2 d2 = d1 - v2;
    if (dot(d1, d1) > dot(d2, d2)) {
      pi += v2.x + pjm2 - 0.5;
      pj += v2.y;
    }
  }
  return ivec2(pi, pj);
}
`;function Ve([e,t],n){return[(e+(t&1)/2)*n*j,t*n*M]}var He=`\
#version 300 es
#define SHADER_NAME hexagon-cell-layer-vertex-shader
in vec3 positions;
in vec3 normals;
in vec2 instancePositions;
in float instanceElevationValues;
in float instanceColorValues;
uniform sampler2D colorRange;
out vec4 vColor;
${`
const vec2 DIST = vec2(${j}, ${M});

vec2 hexbinCentroid(vec2 binId, float radius) {
  binId.x += fract(binId.y * 0.5);
  return binId * DIST * radius;
}
`}
float interp(float value, vec2 domain, vec2 range) {
float r = min(max((value - domain.x) / (domain.y - domain.x), 0.), 1.);
return mix(range.x, range.y, r);
}
vec4 interp(float value, vec2 domain, sampler2D range) {
float r = (value - domain.x) / (domain.y - domain.x);
return texture(range, vec2(r, 0.5));
}
void main(void) {
geometry.pickingColor = picking_getPickingColorFromInstanceID();
if (isnan(instanceColorValues) ||
instanceColorValues < hexagon.colorDomain.z ||
instanceColorValues > hexagon.colorDomain.w ||
instanceElevationValues < hexagon.elevationDomain.z ||
instanceElevationValues > hexagon.elevationDomain.w
) {
gl_Position = vec4(0.);
return;
}
vec2 commonPosition = hexbinCentroid(instancePositions, column.radius) + (hexagon.originCommon - project.commonOrigin.xy);
commonPosition += positions.xy * column.radius * column.coverage;
geometry.position = vec4(commonPosition, 0.0, 1.0);
geometry.normal = project_normal(normals);
float elevation = 0.0;
if (column.extruded) {
elevation = interp(instanceElevationValues, hexagon.elevationDomain.xy, hexagon.elevationRange);
elevation = project_size(elevation);
geometry.position.z = (positions.z + 1.0) / 2.0 * elevation;
}
gl_Position = project_common_position_to_clipspace(geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
vColor = interp(instanceColorValues, hexagon.colorDomain.xy, colorRange);
vColor.a *= layer.opacity;
if (column.extruded) {
vColor.rgb = lighting_getLightColor(vColor.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);
}
DECKGL_FILTER_COLOR(vColor, geometry);
}
`,Ue={name:`hexagon`,source:`struct HexagonUniforms {
  colorDomain: vec4<f32>,
  elevationDomain: vec4<f32>,
  elevationRange: vec2<f32>,
  originCommon: vec2<f32>,
};

@group(0) @binding(auto) var<uniform> hexagon: HexagonUniforms;
@group(0) @binding(auto) var colorRange: texture_2d<f32>;
@group(0) @binding(auto) var colorRangeSampler: sampler;
`,vs:`layout(std140) uniform hexagonUniforms {
  vec4 colorDomain;
  vec4 elevationDomain;
  vec2 elevationRange;
  vec2 originCommon;
} hexagon;
`,uniformTypes:{colorDomain:`vec4<f32>`,elevationDomain:`vec4<f32>`,elevationRange:`vec2<f32>`,originCommon:`vec2<f32>`}},We=class extends o{getShaders(){let e=super.getShaders();return e.modules.push(Ue),{...e,source:Le,vs:He}}initializeState(){super.initializeState();let e=this.getAttributeManager();e.remove([`instanceElevations`,`instanceFillColors`,`instanceLineColors`,`instanceStrokeWidths`]),e.addInstanced({instancePositions:{size:2,type:`float32`,accessor:`getBin`},instanceColorValues:{size:1,type:`float32`,accessor:`getColorValue`},instanceElevationValues:{size:1,type:`float32`,accessor:`getElevationValue`}})}updateState(e){super.updateState(e);let{props:t,oldProps:n}=e,r=this.state.fillModel;if(n.colorRange!==t.colorRange){this.state.colorTexture?.destroy(),this.state.colorTexture=k(this.context.device,t.colorRange,t.colorScaleType);let e={colorRange:this.state.colorTexture};r.shaderInputs.setProps({hexagon:e})}else n.colorScaleType!==t.colorScaleType&&O(this.state.colorTexture,t.colorScaleType)}finalizeState(e){super.finalizeState(e),this.state.colorTexture?.destroy()}draw({uniforms:e}){let{radius:t,hexOriginCommon:n,elevationRange:r,elevationScale:i,extruded:a,coverage:o,colorDomain:s,elevationDomain:c}=this.props,l=this.props.colorCutoff||[-1/0,1/0],u=this.props.elevationCutoff||[-1/0,1/0],d=this.state.fillModel,f={colorDomain:[Math.max(s[0],l[0]),Math.min(s[1],l[1]),Math.max(s[0]-1,l[0]),Math.min(s[1]+1,l[1])],elevationDomain:[Math.max(c[0],u[0]),Math.min(c[1],u[1]),Math.max(c[0]-1,u[0]),Math.min(c[1]+1,u[1])],elevationRange:[r[0]*i,r[1]*i],originCommon:n};d.shaderInputs.setProps({column:{extruded:a,coverage:o,radius:t},hexagon:f}),d.draw(this.context.renderPass)}};We.layerName=`HexagonCellLayer`;var Ge={name:`binOptions`,vs:`layout(std140) uniform binOptionsUniforms {
  vec2 hexOriginCommon;
  float radiusCommon;
} binOptions;
`,uniformTypes:{hexOriginCommon:`vec2<f32>`,radiusCommon:`f32`}};function Ke(){}var qe={gpuAggregation:!0,colorDomain:null,colorRange:E,getColorValue:{type:`accessor`,value:null},getColorWeight:{type:`accessor`,value:1},colorAggregation:`SUM`,lowerPercentile:{type:`number`,min:0,max:100,value:0},upperPercentile:{type:`number`,min:0,max:100,value:100},colorScaleType:`quantize`,onSetColorDomain:Ke,elevationDomain:null,elevationRange:[0,1e3],getElevationValue:{type:`accessor`,value:null},getElevationWeight:{type:`accessor`,value:1},elevationAggregation:`SUM`,elevationScale:{type:`number`,min:0,value:1},elevationLowerPercentile:{type:`number`,min:0,max:100,value:0},elevationUpperPercentile:{type:`number`,min:0,max:100,value:100},elevationScaleType:`linear`,onSetElevationDomain:Ke,radius:{type:`number`,min:1,value:1e3},coverage:{type:`number`,min:0,max:1,value:1},getPosition:{type:`accessor`,value:e=>e.position},hexagonAggregator:{type:`function`,optional:!0,value:null},extruded:!1,material:!0},P=class extends T{getAggregatorType(){let{gpuAggregation:t,hexagonAggregator:n,getColorValue:r,getElevationValue:i}=this.props;return t&&(n||r||i)?(e.warn(`Features not supported by GPU aggregation, falling back to CPU`)(),`cpu`):t&&w.isSupported(this.context.device)?`gpu`:`cpu`}createAggregator(e){if(e===`cpu`){let{hexagonAggregator:e,radius:t}=this.props;return new S({dimensions:2,getBin:{sources:[`positions`],getValue:({positions:n},r,i)=>{if(e)return e(n,t);let a=this.state.aggregatorViewport.projectPosition(n),{radiusCommon:o,hexOriginCommon:s}=i;return N([a[0]-s[0],a[1]-s[1]],o)}},getValue:[{sources:[`colorWeights`],getValue:({colorWeights:e})=>e},{sources:[`elevationWeights`],getValue:({elevationWeights:e})=>e}]})}return new w(this.context.device,{dimensions:2,channelCount:2,bufferLayout:this.getAttributeManager().getBufferLayouts({isInstanced:!1}),...super.getShaders({modules:[l,Ge],vs:`
  in vec3 positions;
  in vec3 positions64Low;
  in float colorWeights;
  in float elevationWeights;
  
  ${Be}

  void getBin(out ivec2 binId) {
    vec3 positionCommon = project_position(positions, positions64Low);
    binId = pointToHexbin(positionCommon.xy, binOptions.radiusCommon);
  }
  void getValue(out vec2 value) {
    value = vec2(colorWeights, elevationWeights);
  }
  `})})}initializeState(){super.initializeState(),this.getAttributeManager().add({positions:{size:3,accessor:`getPosition`,type:`float64`,fp64:this.use64bitPositions()},colorWeights:{size:1,accessor:`getColorWeight`},elevationWeights:{size:1,accessor:`getElevationWeight`}})}updateState(e){let t=super.updateState(e),{props:n,oldProps:r,changeFlags:i}=e,{aggregator:a}=this.state;if((i.dataChanged||!this.state.dataAsArray)&&(n.getColorValue||n.getElevationValue)&&(this.state.dataAsArray=Array.from(y(n.data).iterable)),t||i.dataChanged||n.radius!==r.radius||n.getColorValue!==r.getColorValue||n.getElevationValue!==r.getElevationValue||n.colorAggregation!==r.colorAggregation||n.elevationAggregation!==r.elevationAggregation){this._updateBinOptions();let{radiusCommon:e,hexOriginCommon:t,binIdRange:r,dataAsArray:i}=this.state;if(a.setProps({binIdRange:r,pointCount:this.getNumInstances(),operations:[n.colorAggregation,n.elevationAggregation],binOptions:{radiusCommon:e,hexOriginCommon:t},onUpdate:this._onAggregationUpdate.bind(this)}),i){let{getColorValue:e,getElevationValue:t}=this.props;a.setProps({customOperations:[e&&(t=>e(t.map(e=>i[e]),{indices:t,data:n.data})),t&&(e=>t(e.map(e=>i[e]),{indices:e,data:n.data}))]})}}return i.updateTriggersChanged&&i.updateTriggersChanged.getColorValue&&a.setNeedsUpdate(0),i.updateTriggersChanged&&i.updateTriggersChanged.getElevationValue&&a.setNeedsUpdate(1),t}_updateBinOptions(){let e=this.getBounds(),t=1,n=[0,0],r=[[0,1],[0,1]],a=this.context.viewport;if(e&&Number.isFinite(e[0][0])){let o=[(e[0][0]+e[1][0])/2,(e[0][1]+e[1][1])/2],{radius:s}=this.props,{unitsPerMeter:c}=a.getDistanceScales(o);t=c[0]*s;let l=N(a.projectFlat(o),t);o=a.unprojectFlat(Ve(l,t));let u=a.constructor;a=a.isGeospatial?new u({longitude:o[0],latitude:o[1],zoom:12}):new i({position:[o[0],o[1],0],zoom:12}),n=[Math.fround(a.center[0]),Math.fround(a.center[1])],r=Ie({dataBounds:e,getBinId:e=>{let r=a.projectFlat(e);return r[0]-=n[0],r[1]-=n[1],N(r,t)},padding:1})}this.setState({radiusCommon:t,hexOriginCommon:n,binIdRange:r,aggregatorViewport:a})}draw(e){e.shaderModuleProps.project&&(e.shaderModuleProps.project.viewport=this.state.aggregatorViewport),super.draw(e)}_onAggregationUpdate({channel:e}){let t=this.getCurrentLayer().props,{aggregator:n}=this.state;if(e===0){let e=n.getResult(0);this.setState({colors:new A(e,n.binCount)}),t.onSetColorDomain(n.getResultDomain(0))}else if(e===1){let e=n.getResult(1);this.setState({elevations:new A(e,n.binCount)}),t.onSetElevationDomain(n.getResultDomain(1))}}onAttributeChange(e){let{aggregator:t}=this.state;switch(e){case`positions`:t.setNeedsUpdate(),this._updateBinOptions();let{radiusCommon:e,hexOriginCommon:n,binIdRange:r}=this.state;t.setProps({binIdRange:r,binOptions:{radiusCommon:e,hexOriginCommon:n}});break;case`colorWeights`:t.setNeedsUpdate(0);break;case`elevationWeights`:t.setNeedsUpdate(1)}}renderLayers(){let{aggregator:e,radiusCommon:t,hexOriginCommon:n}=this.state,{elevationScale:r,colorRange:i,elevationRange:a,extruded:o,coverage:s,material:c,transitions:l,colorScaleType:u,lowerPercentile:d,upperPercentile:f,colorDomain:p,elevationScaleType:m,elevationLowerPercentile:h,elevationUpperPercentile:g,elevationDomain:_}=this.props,v=this.getSubLayerClass(`cells`,We),y=e.getBins(),b=this.state.colors?.update({scaleType:u,lowerPercentile:d,upperPercentile:f}),x=this.state.elevations?.update({scaleType:m,lowerPercentile:h,upperPercentile:g});return!b||!x?null:new v(this.getSubLayerProps({id:`cells`}),{data:{length:e.binCount,attributes:{getBin:y,getColorValue:b.attribute,getElevationValue:x.attribute}},dataComparator:(e,t)=>e.length===t.length,updateTriggers:{getBin:[y],getColorValue:[b.attribute],getElevationValue:[x.attribute]},diskResolution:6,vertices:ze,radius:t,hexOriginCommon:n,elevationScale:r,colorRange:i,colorScaleType:u,elevationRange:a,extruded:o,coverage:s,material:c,colorDomain:b.domain||p||e.getResultDomain(0),elevationDomain:x.domain||_||e.getResultDomain(1),colorCutoff:b.cutoff,elevationCutoff:x.cutoff,transitions:l&&{getFillColor:l.getColorValue||l.getColorWeight,getElevation:l.getElevationValue||l.getElevationWeight},extensions:[]})}getPickingInfo(e){let t=e.info,{index:n}=t;if(n>=0){let e=this.state.aggregator.getBin(n),r;if(e){let t=Ve(e.id,this.state.radiusCommon),n=this.context.viewport.unprojectFlat(t);r={col:e.id[0],row:e.id[1],position:n,colorValue:e.value[0],elevationValue:e.value[1],count:e.count},e.pointIndices&&(r.pointIndices=e.pointIndices,r.points=Array.isArray(this.props.data)?e.pointIndices.map(e=>this.props.data[e]):[])}t.object=r}return t}};P.layerName=`HexagonLayer`,P.defaultProps=qe;var F=.5,I=1/6,L={N:[0,F],E:[F,0],S:[0,-.5],W:[-.5,0],NE:[F,F],NW:[-.5,F],SE:[F,-.5],SW:[-.5,-.5]},R=[L.W,L.SW,L.S],z=[L.S,L.SE,L.E],B=[L.E,L.NE,L.N],V=[L.NW,L.W,L.N],H=[[-.5,I],[-.5,-.16666666666666666],[-.16666666666666666,-.5],[I,-.5]],U=[[-.16666666666666666,-.5],[I,-.5],[F,-.16666666666666666],[F,I]],W=[[F,-.16666666666666666],[F,I],[I,F],[-.16666666666666666,F]],G=[[-.5,I],[-.5,-.16666666666666666],[I,F],[-.16666666666666666,F]],Je=[L.W,L.SW,L.SE,L.E],Ye=[L.S,L.SE,L.NE,L.N],Xe=[L.NW,L.W,L.E,L.NE],Ze=[L.NW,L.SW,L.S,L.N],Qe=[[-.5,I],[-.5,-.16666666666666666],[F,-.16666666666666666],[F,I]],$e=[[-.16666666666666666,-.5],[I,-.5],[I,F],[-.16666666666666666,F]],et=[L.NW,L.SW,L.SE,L.NE],tt=[L.NW,L.SW,L.SE,L.E,L.N],nt=[L.W,L.SW,L.SE,L.NE,L.N],rt=[L.NW,L.W,L.S,L.SE,L.NE],it=[L.NW,L.SW,L.S,L.E,L.NE],at=[L.NW,L.W,[F,-.16666666666666666],[F,I],L.N],ot=[[-.16666666666666666,-.5],[I,-.5],L.E,L.NE,L.N],st=[[-.5,I],[-.5,-.16666666666666666],L.S,L.SE,L.E],ct=[L.W,L.SW,L.S,[I,F],[-.16666666666666666,F]],lt=[L.NW,L.W,[-.16666666666666666,-.5],[I,-.5],L.N],ut=[[-.5,I],[-.5,-.16666666666666666],L.E,L.NE,L.N],dt=[L.S,L.SE,L.E,[I,F],[-.16666666666666666,F]],ft=[L.W,L.SW,L.S,[F,-.16666666666666666],[F,I]],pt=[L.W,L.SW,L.SE,L.E,[I,F],[-.16666666666666666,F]],mt=[[-.5,I],[-.5,-.16666666666666666],L.S,L.SE,L.NE,L.N],ht=[L.NW,L.W,[-.16666666666666666,-.5],[I,-.5],L.E,L.NE],gt=[L.NW,L.SW,L.S,[F,-.16666666666666666],[F,I],L.N],K=[L.W,L.SW,L.S,L.E,L.NE,L.N],q=[L.NW,L.W,L.S,L.SE,L.E,L.N],J=[[-.5,I],[-.5,-.16666666666666666],[-.16666666666666666,-.5],[I,-.5],L.E,L.NE,L.N],Y=[L.W,L.SW,L.S,[F,-.16666666666666666],[F,I],[I,F],[-.16666666666666666,F]],X=[L.NW,L.W,[-.16666666666666666,-.5],[I,-.5],[F,-.16666666666666666],[F,I],L.N],Z=[[-.5,I],[-.5,-.16666666666666666],L.S,L.SE,L.E,[I,F],[-.16666666666666666,F]],_t=[[-.5,I],[-.5,-.16666666666666666],[-.16666666666666666,-.5],[I,-.5],[F,-.16666666666666666],[F,I],[I,F],[-.16666666666666666,F]],vt={0:[],1:[[L.W,L.S]],2:[[L.S,L.E]],3:[[L.W,L.E]],4:[[L.N,L.E]],5:{0:[[L.W,L.S],[L.N,L.E]],1:[[L.W,L.N],[L.S,L.E]]},6:[[L.N,L.S]],7:[[L.W,L.N]],8:[[L.W,L.N]],9:[[L.N,L.S]],10:{0:[[L.W,L.N],[L.S,L.E]],1:[[L.W,L.S],[L.N,L.E]]},11:[[L.N,L.E]],12:[[L.W,L.E]],13:[[L.S,L.E]],14:[[L.W,L.S]],15:[]};function Q(e){return parseInt(e,4)}var yt={[Q(`0000`)]:[],[Q(`2222`)]:[],[Q(`2221`)]:[R],[Q(`2212`)]:[z],[Q(`2122`)]:[B],[Q(`1222`)]:[V],[Q(`0001`)]:[R],[Q(`0010`)]:[z],[Q(`0100`)]:[B],[Q(`1000`)]:[V],[Q(`2220`)]:[H],[Q(`2202`)]:[U],[Q(`2022`)]:[W],[Q(`0222`)]:[G],[Q(`0002`)]:[H],[Q(`0020`)]:[U],[Q(`0200`)]:[W],[Q(`2000`)]:[G],[Q(`0011`)]:[Je],[Q(`0110`)]:[Ye],[Q(`1100`)]:[Xe],[Q(`1001`)]:[Ze],[Q(`2211`)]:[Je],[Q(`2112`)]:[Ye],[Q(`1122`)]:[Xe],[Q(`1221`)]:[Ze],[Q(`2200`)]:[Qe],[Q(`2002`)]:[$e],[Q(`0022`)]:[Qe],[Q(`0220`)]:[$e],[Q(`1111`)]:[et],[Q(`1211`)]:[tt],[Q(`2111`)]:[nt],[Q(`1112`)]:[rt],[Q(`1121`)]:[it],[Q(`1011`)]:[tt],[Q(`0111`)]:[nt],[Q(`1110`)]:[rt],[Q(`1101`)]:[it],[Q(`1200`)]:[at],[Q(`0120`)]:[ot],[Q(`0012`)]:[st],[Q(`2001`)]:[ct],[Q(`1022`)]:[at],[Q(`2102`)]:[ot],[Q(`2210`)]:[st],[Q(`0221`)]:[ct],[Q(`1002`)]:[lt],[Q(`2100`)]:[ut],[Q(`0210`)]:[dt],[Q(`0021`)]:[ft],[Q(`1220`)]:[lt],[Q(`0122`)]:[ut],[Q(`2012`)]:[dt],[Q(`2201`)]:[ft],[Q(`0211`)]:[pt],[Q(`2110`)]:[mt],[Q(`1102`)]:[ht],[Q(`1021`)]:[gt],[Q(`2011`)]:[pt],[Q(`0112`)]:[mt],[Q(`1120`)]:[ht],[Q(`1201`)]:[gt],[Q(`2101`)]:[K],[Q(`0121`)]:[K],[Q(`1012`)]:[q],[Q(`1210`)]:[q],[Q(`0101`)]:{0:[R,B],1:[K],2:[K]},[Q(`1010`)]:{0:[V,z],1:[q],2:[q]},[Q(`2121`)]:{0:[K],1:[K],2:[R,B]},[Q(`1212`)]:{0:[q],1:[q],2:[V,z]},[Q(`2120`)]:{0:[J],1:[J],2:[H,B]},[Q(`2021`)]:{0:[Y],1:[Y],2:[R,W]},[Q(`1202`)]:{0:[X],1:[X],2:[V,U]},[Q(`0212`)]:{0:[Z],1:[Z],2:[z,G]},[Q(`0102`)]:{0:[H,B],1:[J],2:[J]},[Q(`0201`)]:{0:[R,W],1:[Y],2:[Y]},[Q(`1020`)]:{0:[V,U],1:[X],2:[X]},[Q(`2010`)]:{0:[z,G],1:[Z],2:[Z]},[Q(`2020`)]:{0:[G,U],1:[_t],2:[H,W]},[Q(`0202`)]:{0:[W,H],1:[_t],2:[G,U]}};function $(e,t){return Number.isNaN(e)?0:Array.isArray(t)?e<t[0]?0:e<t[1]?1:2:+(e>=t)}function bt(e){let{x:t,y:n,xRange:r,yRange:i,getValue:a,threshold:o}=e,s=t<r[0],c=t>=r[1]-1,l=n<i[0],u=n>=i[1]-1,d=s||c||l||u,f=0,p,m,h,g;if(s||u)h=0;else{let e=a(t,n+1);h=$(e,o),f+=e}if(c||u)g=0;else{let e=a(t+1,n+1);g=$(e,o),f+=e}if(c||l)m=0;else{let e=a(t+1,n);m=$(e,o),f+=e}if(s||l)p=0;else{let e=a(t,n);p=$(e,o),f+=e}let _=-1;Number.isFinite(o)&&(_=h<<3|g<<2|m<<1|p),Array.isArray(o)&&(_=h<<6|g<<4|m<<2|p);let v=0;return d||(v=$(f/4,o)),{code:_,meanCode:v}}function xt(e){let{x:t,y:n,z:r,code:i,meanCode:a}=e,o=yt[i];Array.isArray(o)||(o=o[a]);let s=t+1,c=n+1,l=[];return o.forEach(e=>{let t=[];e.forEach(e=>{let n=s+e[0],i=c+e[1];t.push([n,i,r])}),l.push(t)}),l}function St(e){let{x:t,y:n,z:r,code:i,meanCode:a}=e,o=vt[i];Array.isArray(o)||(o=o[a]);let s=t+1,c=n+1,l=[];return o.forEach(e=>{e.forEach(e=>{let t=s+e[0],n=c+e[1];l.push([t,n,r])})}),l}function Ct({contours:e,getValue:t,xRange:n,yRange:r}){let i=[],a=[],o=0,s=0;for(let c=0;c<e.length;c++){let l=e[c],u=l.zIndex??c,{threshold:d}=l;for(let e=n[0]-1;e<n[1];e++)for(let c=r[0]-1;c<r[1];c++){let{code:f,meanCode:p}=bt({getValue:t,threshold:d,x:e,y:c,xRange:n,yRange:r}),m={x:e,y:c,z:u,code:f,meanCode:p};if(Array.isArray(d)){let e=xt(m);for(let t of e)a[s++]={vertices:t,contour:l}}else{let e=St(m);e.length>0&&(i[o++]={vertices:e,contour:l})}}}return{lines:i,polygons:a}}function wt(e){let{aggregator:t,binIdRange:n,channel:r}=e;if(t instanceof w){let e=t.getResult(r)?.buffer;if(e)return Tt(new Float32Array(e.readSyncWebGL().buffer),n)}if(t instanceof S){let e=t.getResult(r)?.value,n=t.getBins()?.value;if(n&&e)return Et(e,n,t.binCount)}return null}function Tt(e,t){let[[n,r],[i,a]]=t,o=r-n,s=a-i;return(t,r)=>(t-=n,r-=i,t<0||t>=o||r<0||r>=s?NaN:e[r*o+t])}function Et(e,t,n){let r={};for(let i=0;i<n;i++){let n=t[i*2],a=t[i*2+1];r[n]=r[n]||{},r[n][a]=e[i]}return(e,t)=>r[e]?.[t]??NaN}var Dt={name:`binOptions`,vs:`layout(std140) uniform binOptionsUniforms {
  vec2 cellOriginCommon;
  vec2 cellSizeCommon;
} binOptions;
`,uniformTypes:{cellOriginCommon:`vec2<f32>`,cellSizeCommon:`vec2<f32>`}},Ot=[255,255,255,255],kt=1,At={cellSize:{type:`number`,min:1,value:1e3},gridOrigin:{type:`array`,compare:!0,value:[0,0]},getPosition:{type:`accessor`,value:e=>e.position},getWeight:{type:`accessor`,value:1},gpuAggregation:!0,aggregation:`SUM`,contours:{type:`object`,value:[{threshold:1}],optional:!0,compare:3},zOffset:.005},jt=class extends T{getAggregatorType(){return this.props.gpuAggregation&&w.isSupported(this.context.device)?`gpu`:`cpu`}createAggregator(e){return e===`cpu`?new S({dimensions:2,getBin:{sources:[`positions`],getValue:({positions:e},t,n)=>{let r=this.state.aggregatorViewport.projectPosition(e),{cellSizeCommon:i,cellOriginCommon:a}=n;return[Math.floor((r[0]-a[0])/i[0]),Math.floor((r[1]-a[1])/i[1])]}},getValue:[{sources:[`counts`],getValue:({counts:e})=>e}],onUpdate:this._onAggregationUpdate.bind(this)}):new w(this.context.device,{dimensions:2,channelCount:1,bufferLayout:this.getAttributeManager().getBufferLayouts({isInstanced:!1}),...super.getShaders({modules:[l,Dt],vs:`
  in vec3 positions;
  in vec3 positions64Low;
  in float counts;

  void getBin(out ivec2 binId) {
    vec3 positionCommon = project_position(positions, positions64Low);
    vec2 gridCoords = floor(positionCommon.xy / binOptions.cellSizeCommon);
    binId = ivec2(gridCoords);
  }
  void getValue(out float value) {
    value = counts;
  }
  `}),onUpdate:this._onAggregationUpdate.bind(this)})}initializeState(){super.initializeState(),this.getAttributeManager().add({positions:{size:3,accessor:`getPosition`,type:`float64`,fp64:this.use64bitPositions()},counts:{size:1,accessor:`getWeight`}})}updateState(e){let t=super.updateState(e),{props:n,oldProps:i,changeFlags:a}=e,{aggregator:o}=this.state;if(t||a.dataChanged||n.cellSize!==i.cellSize||!r(n.gridOrigin,i.gridOrigin,1)||n.aggregation!==i.aggregation){this._updateBinOptions();let{cellSizeCommon:e,cellOriginCommon:t,binIdRange:r}=this.state;o.setProps({binIdRange:r,pointCount:this.getNumInstances(),operations:[n.aggregation],binOptions:{cellSizeCommon:e,cellOriginCommon:t}})}return r(i.contours,n.contours,2)||this.setState({contourData:null}),t}_updateBinOptions(){let e=this.getBounds(),t=[1,1],n=[0,0],r=[[0,1],[0,1]],a=this.context.viewport;if(e&&Number.isFinite(e[0][0])){let o=[(e[0][0]+e[1][0])/2,(e[0][1]+e[1][1])/2],{cellSize:s,gridOrigin:c}=this.props,{unitsPerMeter:l}=a.getDistanceScales(o);t[0]=l[0]*s,t[1]=l[1]*s;let u=a.projectFlat(o);n=[Math.floor((u[0]-c[0])/t[0])*t[0]+c[0],Math.floor((u[1]-c[1])/t[1])*t[1]+c[1]],o=a.unprojectFlat(n);let d=a.constructor;a=a.isGeospatial?new d({longitude:o[0],latitude:o[1],zoom:12}):new i({position:[o[0],o[1],0],zoom:12}),n=[Math.fround(a.center[0]),Math.fround(a.center[1])],r=Ie({dataBounds:e,getBinId:e=>{let r=a.projectFlat(e);return[Math.floor((r[0]-n[0])/t[0]),Math.floor((r[1]-n[1])/t[1])]}})}this.setState({cellSizeCommon:t,cellOriginCommon:n,binIdRange:r,aggregatorViewport:a})}draw(e){e.shaderModuleProps.project&&(e.shaderModuleProps.project.viewport=this.state.aggregatorViewport),super.draw(e)}_onAggregationUpdate(){let{aggregator:e,binIdRange:t}=this.state;this.setState({aggregatedValueReader:wt({aggregator:e,binIdRange:t,channel:0}),contourData:null})}_getContours(){let{aggregatedValueReader:e}=this.state;if(!e)return null;if(!this.state.contourData){let{binIdRange:t}=this.state,{contours:n}=this.props,r=Ct({contours:n,getValue:e,xRange:t[0],yRange:t[1]});this.state.contourData=r}return this.state.contourData}onAttributeChange(e){let{aggregator:t}=this.state;switch(e){case`positions`:t.setNeedsUpdate(),this._updateBinOptions();let{cellSizeCommon:e,cellOriginCommon:n,binIdRange:r}=this.state;t.setProps({binIdRange:r,binOptions:{cellSizeCommon:e,cellOriginCommon:n}});break;case`counts`:t.setNeedsUpdate(0)}}renderLayers(){let e=this._getContours();if(!e)return null;let{lines:r,polygons:i}=e,{zOffset:a}=this.props,{cellOriginCommon:o,cellSizeCommon:s}=this.state,c=this.getSubLayerClass(`lines`,f),l=this.getSubLayerClass(`bands`,_),u=new t().translate([o[0],o[1],0]).scale([s[0],s[1],a]);return[r&&r.length>0&&new c(this.getSubLayerProps({id:`lines`}),{data:r,coordinateSystem:n.CARTESIAN,modelMatrix:u,getPath:e=>e.vertices,getColor:e=>e.contour.color??Ot,getWidth:e=>e.contour.strokeWidth??kt,widthUnits:`pixels`}),i&&i.length>0&&new l(this.getSubLayerProps({id:`bands`}),{data:i,coordinateSystem:n.CARTESIAN,modelMatrix:u,getPolygon:e=>e.vertices,getFillColor:e=>e.contour.color??Ot})]}getPickingInfo(e){let t=e.info,{object:n}=t;return n&&(t.object={contour:n.contour}),t}};jt.layerName=`ContourLayer`,jt.defaultProps=At;var Mt=`struct Attributes {
  @builtin(instance_index) instanceIndex: u32,
  @location(0) positions: vec3<f32>,
  @location(1) normals: vec3<f32>,
  @location(2) instancePositions: vec2<f32>,
  @location(3) instanceColorValues: f32,
  @location(4) instanceElevationValues: f32,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) pickingColor: vec3<f32>,
};

fn interpolate(value: f32, domain: vec2<f32>, range: vec2<f32>) -> f32 {
  let ratio = clamp((value - domain.x) / (domain.y - domain.x), 0.0, 1.0);
  return mix(range.x, range.y, ratio);
}

fn sampleColorRange(value: f32, domain: vec2<f32>) -> vec4<f32> {
  let ratio = (value - domain.x) / (domain.y - domain.x);
  return textureSampleLevel(colorRange, colorRangeSampler, vec2<f32>(ratio, 0.5), 0.0);
}

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var output: Varyings;
  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.instanceIndex);
  output.pickingColor = geometry.pickingColor;

  if (
    attributes.instanceColorValues != attributes.instanceColorValues ||
    attributes.instanceColorValues < grid.colorDomain.z ||
    attributes.instanceColorValues > grid.colorDomain.w ||
    attributes.instanceElevationValues < grid.elevationDomain.z ||
    attributes.instanceElevationValues > grid.elevationDomain.w
  ) {
    output.position = vec4<f32>(0.0);
    output.color = vec4<f32>(0.0);
    return output;
  }

  let commonPosition =
    (attributes.instancePositions +
      (attributes.positions.xy + vec2<f32>(1.0)) * 0.5 * column.coverage) *
      grid.sizeCommon +
    grid.originCommon -
    project.commonOrigin.xy;
  geometry.position = vec4<f32>(commonPosition, 0.0, 1.0);
  geometry.normal = project_normal(attributes.normals);

  if (column.extruded > 0.5) {
    var elevation = interpolate(
      attributes.instanceElevationValues,
      grid.elevationDomain.xy,
      grid.elevationRange
    );
    elevation = project_size_float(elevation);
    geometry.position.z = (attributes.positions.z + 1.0) * 0.5 * elevation;
  }

  output.position = project_common_position_to_clipspace(geometry.position);
  var colorValue = sampleColorRange(attributes.instanceColorValues, grid.colorDomain.xy);
  if (column.extruded > 0.5) {
    colorValue = vec4<f32>(
      lighting_getLightColor2(
        colorValue.rgb,
        project.cameraPosition,
        geometry.position.xyz,
        geometry.normal
      ),
      colorValue.a
    );
  }
  output.color = vec4<f32>(colorValue.rgb, colorValue.a * layer.opacity);
  return output;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(varyings.pickingColor)) {
      discard;
    }
    return vec4<f32>(varyings.pickingColor, 1.0);
  }

  var color = varyings.color;
  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(varyings.pickingColor - highlightedObjectColor))) {
      let highlightAlpha = picking.highlightColor.a;
      let blendedAlpha = highlightAlpha + color.a * (1.0 - highlightAlpha);
      if (blendedAlpha > 0.0) {
        let highlightRatio = highlightAlpha / blendedAlpha;
        color = vec4<f32>(
          mix(color.rgb, picking.highlightColor.rgb, highlightRatio),
          blendedAlpha
        );
      } else {
        color = vec4<f32>(color.rgb, 0.0);
      }
    }
  }

  return deckgl_premultiplied_alpha(color);
}
`,Nt=`#version 300 es
#define SHADER_NAME grid-cell-layer-vertex-shader
in vec3 positions;
in vec3 normals;
in vec2 instancePositions;
in float instanceElevationValues;
in float instanceColorValues;
uniform sampler2D colorRange;
out vec4 vColor;
float interp(float value, vec2 domain, vec2 range) {
float r = min(max((value - domain.x) / (domain.y - domain.x), 0.), 1.);
return mix(range.x, range.y, r);
}
vec4 interp(float value, vec2 domain, sampler2D range) {
float r = (value - domain.x) / (domain.y - domain.x);
return texture(range, vec2(r, 0.5));
}
void main(void) {
geometry.pickingColor = picking_getPickingColorFromInstanceID();
if (isnan(instanceColorValues) ||
instanceColorValues < grid.colorDomain.z ||
instanceColorValues > grid.colorDomain.w ||
instanceElevationValues < grid.elevationDomain.z ||
instanceElevationValues > grid.elevationDomain.w
) {
gl_Position = vec4(0.);
return;
}
vec2 commonPosition = (instancePositions + (positions.xy + 1.0) / 2.0 * column.coverage) * grid.sizeCommon + grid.originCommon - project.commonOrigin.xy;
geometry.position = vec4(commonPosition, 0.0, 1.0);
geometry.normal = project_normal(normals);
float elevation = 0.0;
if (column.extruded) {
elevation = interp(instanceElevationValues, grid.elevationDomain.xy, grid.elevationRange);
elevation = project_size(elevation);
geometry.position.z = (positions.z + 1.0) / 2.0 * elevation;
}
gl_Position = project_common_position_to_clipspace(geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
vColor = interp(instanceColorValues, grid.colorDomain.xy, colorRange);
vColor.a *= layer.opacity;
if (column.extruded) {
vColor.rgb = lighting_getLightColor(vColor.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);
}
DECKGL_FILTER_COLOR(vColor, geometry);
}
`,Pt={name:`grid`,source:`struct gridUniforms {
  colorDomain: vec4<f32>,
  elevationDomain: vec4<f32>,
  elevationRange: vec2<f32>,
  originCommon: vec2<f32>,
  sizeCommon: vec2<f32>,
};

@group(0) @binding(auto) var<uniform> grid: gridUniforms;
@group(0) @binding(auto) var colorRange: texture_2d<f32>;
@group(0) @binding(auto) var colorRangeSampler: sampler;
`,vs:`layout(std140) uniform gridUniforms {
  vec4 colorDomain;
  vec4 elevationDomain;
  vec2 elevationRange;
  vec2 originCommon;
  vec2 sizeCommon;
} grid;
`,uniformTypes:{colorDomain:`vec4<f32>`,elevationDomain:`vec4<f32>`,elevationRange:`vec2<f32>`,originCommon:`vec2<f32>`,sizeCommon:`vec2<f32>`}},Ft=class extends o{getShaders(){let e=super.getShaders();return e.modules.push(Pt),{...e,source:Mt,vs:Nt}}initializeState(){super.initializeState();let e=this.getAttributeManager();e.remove([`instanceElevations`,`instanceFillColors`,`instanceLineColors`,`instanceStrokeWidths`]),e.addInstanced({instancePositions:{size:2,type:`float32`,accessor:`getBin`},instanceColorValues:{size:1,type:`float32`,accessor:`getColorValue`},instanceElevationValues:{size:1,type:`float32`,accessor:`getElevationValue`}})}updateState(e){super.updateState(e);let{props:t,oldProps:n}=e,r=this.state.fillModel;if(n.colorRange!==t.colorRange){this.state.colorTexture?.destroy(),this.state.colorTexture=k(this.context.device,t.colorRange,t.colorScaleType);let e={colorRange:this.state.colorTexture};r.shaderInputs.setProps({grid:e})}else n.colorScaleType!==t.colorScaleType&&O(this.state.colorTexture,t.colorScaleType)}finalizeState(e){super.finalizeState(e),this.state.colorTexture?.destroy()}_updateGeometry(){let e=new m;this._setFillGeometry(e)}draw({uniforms:e}){let{cellOriginCommon:t,cellSizeCommon:n,elevationRange:r,elevationScale:i,extruded:a,coverage:o,colorDomain:s,elevationDomain:c}=this.props,l=this.props.colorCutoff||[-1/0,1/0],u=this.props.elevationCutoff||[-1/0,1/0],d=this.state.fillModel,f={colorDomain:[Math.max(s[0],l[0]),Math.min(s[1],l[1]),Math.max(s[0]-1,l[0]),Math.min(s[1]+1,l[1])],elevationDomain:[Math.max(c[0],u[0]),Math.min(c[1],u[1]),Math.max(c[0]-1,u[0]),Math.min(c[1]+1,u[1])],elevationRange:[r[0]*i,r[1]*i],originCommon:t,sizeCommon:n};d.shaderInputs.setProps({column:{extruded:a,coverage:o},grid:f}),d.draw(this.context.renderPass)}};Ft.layerName=`GridCellLayer`;var It={name:`binOptions`,vs:`layout(std140) uniform binOptionsUniforms {
  vec2 cellOriginCommon;
  vec2 cellSizeCommon;
} binOptions;
`,uniformTypes:{cellOriginCommon:`vec2<f32>`,cellSizeCommon:`vec2<f32>`}};function Lt(){}var Rt={gpuAggregation:!0,colorDomain:null,colorRange:E,getColorValue:{type:`accessor`,value:null},getColorWeight:{type:`accessor`,value:1},colorAggregation:`SUM`,lowerPercentile:{type:`number`,min:0,max:100,value:0},upperPercentile:{type:`number`,min:0,max:100,value:100},colorScaleType:`quantize`,onSetColorDomain:Lt,elevationDomain:null,elevationRange:[0,1e3],getElevationValue:{type:`accessor`,value:null},getElevationWeight:{type:`accessor`,value:1},elevationAggregation:`SUM`,elevationScale:{type:`number`,min:0,value:1},elevationLowerPercentile:{type:`number`,min:0,max:100,value:0},elevationUpperPercentile:{type:`number`,min:0,max:100,value:100},elevationScaleType:`linear`,onSetElevationDomain:Lt,cellSize:{type:`number`,min:0,value:1e3},coverage:{type:`number`,min:0,max:1,value:1},getPosition:{type:`accessor`,value:e=>e.position},gridAggregator:{type:`function`,optional:!0,value:null},extruded:!1,material:!0},zt=class extends T{getAggregatorType(){let{gpuAggregation:t,gridAggregator:n,getColorValue:r,getElevationValue:i}=this.props;return t&&(n||r||i)?(e.warn(`Features not supported by GPU aggregation, falling back to CPU`)(),`cpu`):t&&w.isSupported(this.context.device)?`gpu`:`cpu`}createAggregator(e){if(e===`cpu`){let{gridAggregator:e,cellSize:t}=this.props;return new S({dimensions:2,getBin:{sources:[`positions`],getValue:({positions:n},r,i)=>{if(e)return e(n,t);let a=this.state.aggregatorViewport.projectPosition(n),{cellSizeCommon:o,cellOriginCommon:s}=i;return[Math.floor((a[0]-s[0])/o[0]),Math.floor((a[1]-s[1])/o[1])]}},getValue:[{sources:[`colorWeights`],getValue:({colorWeights:e})=>e},{sources:[`elevationWeights`],getValue:({elevationWeights:e})=>e}]})}return new w(this.context.device,{dimensions:2,channelCount:2,bufferLayout:this.getAttributeManager().getBufferLayouts({isInstanced:!1}),...super.getShaders({modules:[l,It],vs:`
  in vec3 positions;
  in vec3 positions64Low;
  in float colorWeights;
  in float elevationWeights;

  void getBin(out ivec2 binId) {
    vec3 positionCommon = project_position(positions, positions64Low);
    vec2 gridCoords = floor(positionCommon.xy / binOptions.cellSizeCommon);
    binId = ivec2(gridCoords);
  }
  void getValue(out vec2 value) {
    value = vec2(colorWeights, elevationWeights);
  }
  `})})}initializeState(){super.initializeState(),this.getAttributeManager().add({positions:{size:3,accessor:`getPosition`,type:`float64`,fp64:this.use64bitPositions()},colorWeights:{size:1,accessor:`getColorWeight`},elevationWeights:{size:1,accessor:`getElevationWeight`}})}updateState(e){let t=super.updateState(e),{props:n,oldProps:r,changeFlags:i}=e,{aggregator:a}=this.state;if((i.dataChanged||!this.state.dataAsArray)&&(n.getColorValue||n.getElevationValue)&&(this.state.dataAsArray=Array.from(y(n.data).iterable)),t||i.dataChanged||n.cellSize!==r.cellSize||n.getColorValue!==r.getColorValue||n.getElevationValue!==r.getElevationValue||n.colorAggregation!==r.colorAggregation||n.elevationAggregation!==r.elevationAggregation){this._updateBinOptions();let{cellSizeCommon:e,cellOriginCommon:t,binIdRange:r,dataAsArray:i}=this.state;if(a.setProps({binIdRange:r,pointCount:this.getNumInstances(),operations:[n.colorAggregation,n.elevationAggregation],binOptions:{cellSizeCommon:e,cellOriginCommon:t},onUpdate:this._onAggregationUpdate.bind(this)}),i){let{getColorValue:e,getElevationValue:t}=this.props;a.setProps({customOperations:[e&&(t=>e(t.map(e=>i[e]),{indices:t,data:n.data})),t&&(e=>t(e.map(e=>i[e]),{indices:e,data:n.data}))]})}}return i.updateTriggersChanged&&i.updateTriggersChanged.getColorValue&&a.setNeedsUpdate(0),i.updateTriggersChanged&&i.updateTriggersChanged.getElevationValue&&a.setNeedsUpdate(1),t}_updateBinOptions(){let e=this.getBounds(),t=[1,1],n=[0,0],r=[[0,1],[0,1]],a=this.context.viewport;if(e&&Number.isFinite(e[0][0])){let o=[(e[0][0]+e[1][0])/2,(e[0][1]+e[1][1])/2],{cellSize:s}=this.props,{unitsPerMeter:c}=a.getDistanceScales(o);t[0]=c[0]*s,t[1]=c[1]*s;let l=a.projectFlat(o);n=[Math.floor(l[0]/t[0])*t[0],Math.floor(l[1]/t[1])*t[1]],o=a.unprojectFlat(n);let u=a.constructor;a=a.isGeospatial?new u({longitude:o[0],latitude:o[1],zoom:12}):new i({position:[o[0],o[1],0],zoom:12}),n=[Math.fround(a.center[0]),Math.fround(a.center[1])],r=Ie({dataBounds:e,getBinId:e=>{let r=a.projectFlat(e);return[Math.floor((r[0]-n[0])/t[0]),Math.floor((r[1]-n[1])/t[1])]}})}this.setState({cellSizeCommon:t,cellOriginCommon:n,binIdRange:r,aggregatorViewport:a})}draw(e){e.shaderModuleProps.project&&(e.shaderModuleProps.project.viewport=this.state.aggregatorViewport),super.draw(e)}_onAggregationUpdate({channel:e}){let t=this.getCurrentLayer().props,{aggregator:n}=this.state;if(e===0){let e=n.getResult(0);this.setState({colors:new A(e,n.binCount)}),t.onSetColorDomain(n.getResultDomain(0))}else if(e===1){let e=n.getResult(1);this.setState({elevations:new A(e,n.binCount)}),t.onSetElevationDomain(n.getResultDomain(1))}}onAttributeChange(e){let{aggregator:t}=this.state;switch(e){case`positions`:t.setNeedsUpdate(),this._updateBinOptions();let{cellSizeCommon:e,cellOriginCommon:n,binIdRange:r}=this.state;t.setProps({binIdRange:r,binOptions:{cellSizeCommon:e,cellOriginCommon:n}});break;case`colorWeights`:t.setNeedsUpdate(0);break;case`elevationWeights`:t.setNeedsUpdate(1)}}renderLayers(){let{aggregator:e,cellOriginCommon:t,cellSizeCommon:n}=this.state,{elevationScale:r,colorRange:i,elevationRange:a,extruded:o,coverage:s,material:c,transitions:l,colorScaleType:u,lowerPercentile:d,upperPercentile:f,colorDomain:p,elevationScaleType:m,elevationLowerPercentile:h,elevationUpperPercentile:g,elevationDomain:_}=this.props,v=this.getSubLayerClass(`cells`,Ft),y=e.getBins(),b=this.state.colors?.update({scaleType:u,lowerPercentile:d,upperPercentile:f}),x=this.state.elevations?.update({scaleType:m,lowerPercentile:h,upperPercentile:g});return!b||!x?null:new v(this.getSubLayerProps({id:`cells`}),{data:{length:e.binCount,attributes:{getBin:y,getColorValue:b.attribute,getElevationValue:x.attribute}},dataComparator:(e,t)=>e.length===t.length,updateTriggers:{getBin:[y],getColorValue:[b.attribute],getElevationValue:[x.attribute]},cellOriginCommon:t,cellSizeCommon:n,elevationScale:r,colorRange:i,colorScaleType:u,elevationRange:a,extruded:o,coverage:s,material:c,colorDomain:b.domain||p||e.getResultDomain(0),elevationDomain:x.domain||_||e.getResultDomain(1),colorCutoff:b.cutoff,elevationCutoff:x.cutoff,transitions:l&&{getFillColor:l.getColorValue||l.getColorWeight,getElevation:l.getElevationValue||l.getElevationWeight},extensions:[]})}getPickingInfo(e){let t=e.info,{index:n}=t;if(n>=0){let e=this.state.aggregator.getBin(n),r;e&&(r={col:e.id[0],row:e.id[1],colorValue:e.value[0],elevationValue:e.value[1],count:e.count},e.pointIndices&&(r.pointIndices=e.pointIndices,r.points=Array.isArray(this.props.data)?e.pointIndices.map(e=>this.props.data[e]):[])),t.object=r}return t}};zt.layerName=`GridLayer`,zt.defaultProps=Rt;function Bt(e){let t=e.map(e=>e[0]),n=e.map(e=>e[1]),r=Math.min.apply(null,t),i=Math.max.apply(null,t);return[r,Math.min.apply(null,n),i,Math.max.apply(null,n)]}function Vt(e,t){return t[0]>=e[0]&&t[2]<=e[2]&&t[1]>=e[1]&&t[3]<=e[3]}var Ht=new Float32Array(12);function Ut(e,t=2){let n=0;for(let r of e)for(let e=0;e<t;e++)Ht[n++]=r[e]||0;return Ht}function Wt(e,t,n){let[r,i,a,o]=e,s=a-r,c=o-i,l=s,u=c;s/c<t/n?l=t/n*c:u=n/t*s,l<t&&(l=t,u=n);let d=(a+r)/2,f=(o+i)/2;return[d-l/2,f-u/2,d+l/2,f+u/2]}function Gt(e,t){let[n,r,i,a]=t;return[(e[0]-n)/(i-n),(e[1]-r)/(a-r)]}var Kt=`struct TriangleAttributes {
  @location(0) positions: vec3<f32>,
  @location(1) texCoords: vec2<f32>,
};

struct TriangleVaryings {
  @builtin(position) position: vec4<f32>,
  @location(0) textureCoordinates: vec2<f32>,
  @location(1) intensityMinimum: f32,
  @location(2) intensityMaximum: f32,
};

@vertex
fn vertexMain(attributes: TriangleAttributes) -> TriangleVaryings {
  var output: TriangleVaryings;
  output.position = project_position_to_clipspace(
    attributes.positions,
    vec3<f32>(0.0),
    vec3<f32>(0.0)
  );
  // WebGPU render-target textures use a top-left origin.
  output.textureCoordinates = vec2<f32>(attributes.texCoords.x, 1.0 - attributes.texCoords.y);

  let maxWeights = textureLoad(maxTexture, vec2<i32>(0), 0);
  var maximumValue = select(maxWeights.r, maxWeights.g, triangle.aggregationMode > 0.5);
  var minimumValue = maximumValue * triangle.threshold;

  if (triangle.colorDomain.y > 0.0) {
    maximumValue = triangle.colorDomain.y;
    minimumValue = triangle.colorDomain.x;
  }

  output.intensityMaximum = triangle.intensity / maximumValue;
  output.intensityMinimum = triangle.intensity / minimumValue;
  return output;
}

@fragment
fn fragmentMain(varyings: TriangleVaryings) -> @location(0) vec4<f32> {
  let weights = textureSample(weightsTexture, weightsTextureSampler, varyings.textureCoordinates);
  var weight = weights.r;

  if (triangle.aggregationMode > 0.5) {
    weight /= max(1.0, weights.a);
  }

  let colorCoordinates = vec2<f32>(
    clamp(weight * varyings.intensityMaximum, 0.0, 1.0),
    0.5
  );
  var color = textureSample(colorTexture, colorTextureSampler, colorCoordinates);

  if (weight <= 0.0) {
    discard;
  }

  color.a *= min(weight * varyings.intensityMinimum, 1.0) * layer.opacity;
  return deckgl_premultiplied_alpha(color);
}
`,qt=`#version 300 es
#define SHADER_NAME heatp-map-layer-vertex-shader
uniform sampler2D maxTexture;
in vec3 positions;
in vec2 texCoords;
out vec2 vTexCoords;
out float vIntensityMin;
out float vIntensityMax;
void main(void) {
gl_Position = project_position_to_clipspace(positions, vec3(0.0), vec3(0.0));
vTexCoords = texCoords;
vec4 maxTexture = texture(maxTexture, vec2(0.5));
float maxValue = triangle.aggregationMode < 0.5 ? maxTexture.r : maxTexture.g;
float minValue = maxValue * triangle.threshold;
if (triangle.colorDomain[1] > 0.) {
maxValue = triangle.colorDomain[1];
minValue = triangle.colorDomain[0];
}
vIntensityMax = triangle.intensity / maxValue;
vIntensityMin = triangle.intensity / minValue;
}
`,Jt=`#version 300 es
#define SHADER_NAME triangle-layer-fragment-shader
precision highp float;
uniform sampler2D weightsTexture;
uniform sampler2D colorTexture;
in vec2 vTexCoords;
in float vIntensityMin;
in float vIntensityMax;
out vec4 fragColor;
vec4 getLinearColor(float value) {
float factor = clamp(value * vIntensityMax, 0., 1.);
vec4 color = texture(colorTexture, vec2(factor, 0.5));
color.a *= min(value * vIntensityMin, 1.0);
return color;
}
void main(void) {
vec4 weights = texture(weightsTexture, vTexCoords);
float weight = weights.r;
if (triangle.aggregationMode > 0.5) {
weight /= max(1.0, weights.a);
}
if (weight <= 0.) {
discard;
}
vec4 linearColor = getLinearColor(weight);
linearColor.a *= layer.opacity;
fragColor = linearColor;
}
`,Yt=`struct triangleUniforms {
  aggregationMode: f32,
  colorDomain: vec2<f32>,
  intensity: f32,
  threshold: f32,
};

@group(0) @binding(auto) var<uniform> triangle: triangleUniforms;
@group(0) @binding(auto) var colorTexture: texture_2d<f32>;
@group(0) @binding(auto) var colorTextureSampler: sampler;
@group(0) @binding(auto) var maxTexture: texture_2d<f32>;
@group(0) @binding(auto) var weightsTexture: texture_2d<f32>;
@group(0) @binding(auto) var weightsTextureSampler: sampler;
`,Xt=`layout(std140) uniform triangleUniforms {
  float aggregationMode;
  vec2 colorDomain;
  float intensity;
  float threshold;
} triangle;
`,Zt={name:`triangle`,source:Yt,vs:Xt,fs:Xt,uniformTypes:{aggregationMode:`f32`,colorDomain:`vec2<f32>`,intensity:`f32`,threshold:`f32`}},Qt=class extends v{getShaders(){return super.getShaders({source:Kt,vs:qt,fs:Jt,modules:[l,g,Zt]})}initializeState({device:e}){this.setState({model:this._getModel(e)})}_getModel(e){let{vertexCount:t,data:n}=this.props;return new u(e,{...this.getShaders(),id:this.props.id,attributes:n.attributes,bufferLayout:[{name:`positions`,format:`float32x3`},{name:`texCoords`,format:`float32x2`}],topology:`triangle-strip`,vertexCount:t})}draw(){let{model:e}=this.state,{aggregationMode:t,colorDomain:n,intensity:r,threshold:i,colorTexture:a,maxTexture:o,weightsTexture:s}=this.props,c={aggregationMode:t,colorDomain:n,intensity:r,threshold:i,colorTexture:a,maxTexture:o,weightsTexture:s};e.shaderInputs.setProps({triangle:c}),e.draw(this.context.renderPass)}};Qt.layerName=`TriangleLayer`;function $t(e,t){let n={};for(let r in e)t.includes(r)||(n[r]=e[r]);return n}var en=class extends h{initializeAggregationLayer(e){super.initializeState(this.context),this.setState({ignoreProps:$t(this.constructor._propTypes,e.data.props),dimensions:e})}updateState(e){super.updateState(e);let{changeFlags:t}=e;if(t.extensionsChanged){let e=this.getShaders({});e&&e.defines&&(e.defines.NON_INSTANCED_MODEL=1),this.updateShaders(e)}this._updateAttributes()}updateAttributes(e){this.setState({changedAttributes:e})}getAttributes(){return this.getAttributeManager().getAttributes()}getModuleSettings(){let{viewport:e,mousePosition:t,device:n}=this.context;return Object.assign(Object.create(this.props),{viewport:e,mousePosition:t,picking:{isActive:0},devicePixelRatio:n.canvasContext.cssToDeviceRatio()})}updateShaders(e){}isAggregationDirty(e,t={}){let{props:n,oldProps:r,changeFlags:i}=e,{compareAll:a=!1,dimension:o}=t,{ignoreProps:c}=this.state,{props:l,accessors:u=[]}=o,{updateTriggersChanged:d}=i;if(i.dataChanged)return!0;if(d){if(d.all)return!0;for(let e of u)if(d[e])return!0}if(a)return i.extensionsChanged?!0:s({oldProps:r,newProps:n,ignoreProps:c,propTypes:this.constructor._propTypes});for(let e of l)if(n[e]!==r[e])return!0;return!1}isAttributeChanged(e){let{changedAttributes:t}=this.state;return e?t&&t[e]!==void 0:!tn(t)}_getAttributeManager(){return new p(this.context.device,{id:this.props.id,stats:this.context.stats})}};en.layerName=`AggregationLayer`;function tn(e){let t=!0;for(let n in e){t=!1;break}return t}var nn=`#version 300 es
in vec3 positions;
in vec3 positions64Low;
in float weights;
out vec4 weightsTexture;
void main()
{
weightsTexture = vec4(weights * weight.weightsScale, 0., 0., 1.);
float radiusTexels = project_pixel_size(weight.radiusPixels) * weight.textureWidth / (weight.commonBounds.z - weight.commonBounds.x);
gl_PointSize = radiusTexels * 2.;
vec3 commonPosition = project_position(positions, positions64Low);
gl_Position.xy = (commonPosition.xy - weight.commonBounds.xy) / (weight.commonBounds.zw - weight.commonBounds.xy) ;
gl_Position.xy = (gl_Position.xy * 2.) - (1.);
gl_Position.w = 1.0;
}
`,rn=`#version 300 es
in vec4 weightsTexture;
out vec4 fragColor;
float gaussianKDE(float u){
return pow(2.71828, -u*u/0.05555)/(1.77245385*0.166666);
}
void main()
{
float dist = length(gl_PointCoord - vec2(0.5, 0.5));
if (dist > 0.5) {
discard;
}
fragColor = weightsTexture * gaussianKDE(2. * dist);
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,an=`#version 300 es
uniform sampler2D inTexture;
out vec4 outTexture;
void main()
{
int yIndex = gl_VertexID / int(maxWeight.textureSize);
int xIndex = gl_VertexID - (yIndex * int(maxWeight.textureSize));
vec2 uv = (0.5 + vec2(float(xIndex), float(yIndex))) / maxWeight.textureSize;
outTexture = texture(inTexture, uv);
gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
gl_PointSize = 1.0;
}
`,on=`#version 300 es
in vec4 outTexture;
out vec4 fragColor;
void main() {
fragColor = outTexture;
fragColor.g = outTexture.r / max(1.0, outTexture.a);
}
`,sn=`struct MaxWeightVaryings {
  @builtin(position) position: vec4<f32>,
  @location(0) weights: vec4<f32>,
};

const MAX_WEIGHT_REDUCTION_SIZE: u32 = 16u;

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> MaxWeightVaryings {
  var output: MaxWeightVaryings;
  let textureSize = u32(maxWeight.textureSize);
  let reducedTextureSize =
    (textureSize + MAX_WEIGHT_REDUCTION_SIZE - 1u) / MAX_WEIGHT_REDUCTION_SIZE;
  let blockCoordinates = vec2<u32>(
    vertexIndex % reducedTextureSize,
    vertexIndex / reducedTextureSize
  );
  var maximumWeights = vec4<f32>(0.0);

  for (var y = 0u; y < MAX_WEIGHT_REDUCTION_SIZE; y++) {
    for (var x = 0u; x < MAX_WEIGHT_REDUCTION_SIZE; x++) {
      let textureCoordinates = blockCoordinates * MAX_WEIGHT_REDUCTION_SIZE + vec2<u32>(x, y);

      if (textureCoordinates.x < textureSize && textureCoordinates.y < textureSize) {
        let weights = textureLoad(inTexture, vec2<i32>(textureCoordinates), 0);
        maximumWeights.r = max(maximumWeights.r, weights.r);
        maximumWeights.g = max(maximumWeights.g, weights.r / max(1.0, weights.a));
        maximumWeights.b = max(maximumWeights.b, weights.b);
        maximumWeights.a = max(maximumWeights.a, weights.a);
      }
    }
  }

  output.position = vec4<f32>(0.0, 0.0, 0.0, 1.0);
  output.weights = maximumWeights;
  return output;
}

@fragment
fn fragmentMain(varyings: MaxWeightVaryings) -> @location(0) vec4<f32> {
  return varyings.weights;
}
`,cn=`struct WeightAttributes {
  @builtin(vertex_index) vertexIndex: u32,
  @location(0) instancePositions: vec3<f32>,
  @location(1) instancePositions64Low: vec3<f32>,
  @location(2) instanceWeights: f32,
};

struct WeightVaryings {
  @builtin(position) position: vec4<f32>,
  @location(0) pointCoordinates: vec2<f32>,
  @location(1) weights: vec4<f32>,
};

const WEIGHT_QUAD_POSITIONS = array<vec2<f32>, 6>(
  vec2<f32>(-1.0, -1.0),
  vec2<f32>(1.0, -1.0),
  vec2<f32>(-1.0, 1.0),
  vec2<f32>(-1.0, 1.0),
  vec2<f32>(1.0, -1.0),
  vec2<f32>(1.0, 1.0)
);

@vertex
fn vertexMain(attributes: WeightAttributes) -> WeightVaryings {
  var output: WeightVaryings;
  let commonPosition = project_position_vec3_f64(
    attributes.instancePositions,
    attributes.instancePositions64Low
  );
  let clipPosition =
    (commonPosition.xy - weight.commonBounds.xy) /
    (weight.commonBounds.zw - weight.commonBounds.xy) * 2.0 - vec2<f32>(1.0);
  let radiusTexels =
    project_pixel_size_float(weight.radiusPixels) * weight.textureWidth /
    (weight.commonBounds.z - weight.commonBounds.x);
  let offset = WEIGHT_QUAD_POSITIONS[attributes.vertexIndex];

  output.position = vec4<f32>(
    clipPosition + offset * radiusTexels * 2.0 / weight.textureWidth,
    0.0,
    1.0
  );
  output.pointCoordinates = (offset + vec2<f32>(1.0)) * 0.5;
  output.weights = vec4<f32>(attributes.instanceWeights * weight.weightsScale, 0.0, 0.0, 1.0);
  return output;
}

@fragment
fn fragmentMain(varyings: WeightVaryings) -> @location(0) vec4<f32> {
  let distanceFromCenter = length(varyings.pointCoordinates - vec2<f32>(0.5));
  if (distanceFromCenter > 0.5) {
    discard;
  }

  let gaussian = exp(-pow(2.0 * distanceFromCenter, 2.0) / 0.05555) /
    (1.77245385 * 0.166666);
  return varyings.weights * gaussian;
}
`,ln={name:`weight`,source:`struct weightUniforms {
  commonBounds: vec4<f32>,
  radiusPixels: f32,
  textureWidth: f32,
  weightsScale: f32,
};

@group(0) @binding(auto) var<uniform> weight: weightUniforms;
`,vs:`layout(std140) uniform weightUniforms {
  vec4 commonBounds;
  float radiusPixels;
  float textureWidth;
  float weightsScale;
} weight;
`,uniformTypes:{commonBounds:`vec4<f32>`,radiusPixels:`f32`,textureWidth:`f32`,weightsScale:`f32`}},un={name:`maxWeight`,source:`struct maxWeightUniforms {
  textureSize: f32,
};

@group(0) @binding(auto) var<uniform> maxWeight: maxWeightUniforms;
@group(0) @binding(auto) var inTexture: texture_2d<f32>;
`,vs:`layout(std140) uniform maxWeightUniforms {
  float textureSize;
} maxWeight;
`,uniformTypes:{textureSize:`f32`}},dn=2,fn=16,pn={format:`rgba8unorm`,dimension:`2d`,width:1,height:1,sampler:{minFilter:`linear`,magFilter:`linear`,addressModeU:`clamp-to-edge`,addressModeV:`clamp-to-edge`}},mn=[0,0],hn={SUM:0,MEAN:1},gn={getPosition:{type:`accessor`,value:e=>e.position},getWeight:{type:`accessor`,value:1},intensity:{type:`number`,min:0,value:1},radiusPixels:{type:`number`,min:1,max:100,value:50},colorRange:E,threshold:{type:`number`,min:0,max:1,value:.05},colorDomain:{type:`array`,value:null,optional:!0},aggregation:`SUM`,weightsTextureSize:{type:`number`,min:128,max:2048,value:2048},debounceTimeout:{type:`number`,min:0,max:1e3,value:500}},_n=[`float32-renderable-webgl`,`texture-blend-float-webgl`],vn={data:{props:[`radiusPixels`]}},yn=class extends en{getShaders(e){let t=[l];return e.modules&&(t=[...t,...e.modules]),super.getShaders({...e,modules:t})}initializeState(){super.initializeAggregationLayer(vn),this.setState({colorDomain:mn}),this._setupTextureParams(),this._setupAttributes(),this._setupResources()}shouldUpdateState({changeFlags:e}){return e.somethingChanged}updateState(e){super.updateState(e),this._updateHeatmapState(e)}_updateHeatmapState(e){let{props:t,oldProps:n}=e,r=this._getChangeFlags(e);if((r.dataChanged||r.viewportChanged)&&(r.boundsChanged=this._updateBounds(r.dataChanged),this._updateTextureRenderingBounds()),r.dataChanged||r.boundsChanged){if(clearTimeout(this.state.updateTimer),this.setState({isWeightMapDirty:!0}),r.dataChanged){let e=this.getShaders({vs:nn,fs:rn});this._createWeightsTransform(e)}}else r.viewportZoomChanged&&this._debouncedUpdateWeightmap();t.colorRange!==n.colorRange&&this._updateColorTexture(e),this.state.isWeightMapDirty&&this._updateWeightmap(),this.setState({zoom:e.context.viewport.zoom})}renderLayers(){let{weightsTexture:e,triPositionBuffer:t,triTexCoordBuffer:n,maxWeightsTexture:r,colorTexture:i,colorDomain:a}=this.state,{updateTriggers:o,intensity:s,threshold:c,aggregation:l}=this.props;return new(this.getSubLayerClass(`triangle`,Qt))(this.getSubLayerProps({id:`triangle-layer`,updateTriggers:o}),{coordinateSystem:`default`,data:{attributes:{positions:t,texCoords:n}},vertexCount:4,maxTexture:r,colorTexture:i,aggregationMode:hn[l]||0,weightsTexture:e,intensity:s,threshold:c,colorDomain:a})}finalizeState(e){super.finalizeState(e);let{weightsTransform:t,weightsTexture:n,maxWeightTransform:r,maxWeightsTexture:i,triPositionBuffer:a,triTexCoordBuffer:o,colorTexture:s,updateTimer:c}=this.state;t?.destroy(),n?.destroy(),r?.destroy(),i?.destroy(),a?.destroy(),o?.destroy(),s?.destroy(),c&&clearTimeout(c)}_getAttributeManager(){return new p(this.context.device,{id:this.props.id,stats:this.context.stats})}_getChangeFlags(e){let t={},{dimensions:n}=this.state;t.dataChanged=this.isAttributeChanged()&&`attribute changed`||this.isAggregationDirty(e,{compareAll:!0,dimension:n.data})&&`aggregation is dirty`,t.viewportChanged=e.changeFlags.viewportChanged;let{zoom:r}=this.state;return(!e.context.viewport||e.context.viewport.zoom!==r)&&(t.viewportZoomChanged=!0),t}_createTextures(){let{textureSize:e,format:t}=this.state;this.setState({weightsTexture:this.context.device.createTexture({...pn,width:e,height:e,format:t}),maxWeightsTexture:this.context.device.createTexture({...pn,width:1,height:1,format:t})})}_setupAttributes(){let e=this.getAttributeManager();this.context.device.type===`webgpu`?(e.addInstanced({instancePositions:{size:3,type:`float64`,accessor:`getPosition`,transform:e=>[e[0],e[1],e[2]??0]},instanceWeights:{size:1,accessor:`getWeight`}}),this.setState({positionAttributeName:`instancePositions`})):(e.add({positions:{size:3,type:`float64`,accessor:`getPosition`},weights:{size:1,accessor:`getWeight`}}),this.setState({positionAttributeName:`positions`}))}_setupTextureParams(){let{device:t}=this.context,{weightsTextureSize:n}=this.props,r=Math.min(n,t.limits.maxTextureDimension2D),i=t.type===`webgpu`,a=i?t.getTextureFormatCapabilities(`rgba16float`).blend:_n.every(e=>t.features.has(e)),o=a?i?`rgba16float`:`rgba32float`:`rgba8unorm`,s=a?1:1/255;this.setState({textureSize:r,format:o,weightsScale:s}),a||e.warn(`HeatmapLayer: ${this.id} rendering to float texture not supported, falling back to low precision format`)()}_createWeightsTransform(e){let{weightsTransform:t}=this.state,{weightsTexture:n}=this.state,r=this.context.device.type===`webgpu`,i=this.getAttributeManager();t?.destroy(),t=new te(this.context.device,{id:`${this.id}-weights-transform`,...e,source:cn,bufferLayout:i.getBufferLayouts({isInstanced:r}),vertexCount:r?6:1,...r?{colorAttachmentFormats:[n.format],isInstanced:!0,instanceCount:this.getNumInstances()}:{},targetTexture:n,parameters:{depthWriteEnabled:!1,blend:!0,blendColorOperation:`add`,blendColorSrcFactor:`one`,blendColorDstFactor:`one`,blendAlphaSrcFactor:`one`,blendAlphaDstFactor:`one`},topology:r?`triangle-list`:`point-list`,modules:[...e.modules,ln]}),this.setState({weightsTransform:t})}_setupResources(){this._createTextures();let{device:e}=this.context,{textureSize:t,weightsTexture:n,maxWeightsTexture:r}=this.state,i=this.getShaders({vs:nn,fs:rn});this._createWeightsTransform(i);let a=this.getShaders({source:sn,vs:an,fs:on,modules:[un]}),o=new te(e,{id:`${this.id}-max-weights-transform`,targetTexture:r,...a,...e.type===`webgpu`?{colorAttachmentFormats:[r.format]}:{},vertexCount:e.type===`webgpu`?Math.ceil(t/fn)**2:t*t,topology:`point-list`,parameters:{depthWriteEnabled:!1,blend:!0,blendColorOperation:`max`,blendAlphaOperation:`max`,blendColorSrcFactor:`one`,blendColorDstFactor:`one`,blendAlphaSrcFactor:`one`,blendAlphaDstFactor:`one`}}),s={inTexture:n,textureSize:t};o.model.shaderInputs.setProps({maxWeight:s}),this.setState({weightsTexture:n,maxWeightsTexture:r,maxWeightTransform:o,zoom:null,triPositionBuffer:e.createBuffer({byteLength:48}),triTexCoordBuffer:e.createBuffer({byteLength:48})})}updateShaders(e){this._createWeightsTransform({vs:nn,fs:rn,...e})}_updateMaxWeightValue(){let{maxWeightTransform:e}=this.state;e.run({parameters:{viewport:[0,0,1,1]},clearColor:[0,0,0,0]})}_updateBounds(e=!1){let{viewport:t}=this.context,n=[t.unproject([0,0]),t.unproject([t.width,0]),t.unproject([0,t.height]),t.unproject([t.width,t.height])].map(e=>e.map(Math.fround)),r=Bt(n),i={visibleWorldBounds:r,viewportCorners:n},a=!1;if(e||!this.state.worldBounds||!Vt(this.state.worldBounds,r)){let e=this._worldToCommonBounds(r),t=this._commonToWorldBounds(e);this.props.coordinateSystem===`lnglat`&&(t[1]=Math.max(t[1],-85.051129),t[3]=Math.min(t[3],85.051129),t[0]=Math.max(t[0],-360),t[2]=Math.min(t[2],360));let n=this._worldToCommonBounds(t);i.worldBounds=t,i.normalizedCommonBounds=n,a=!0}return this.setState(i),a}_updateTextureRenderingBounds(){let{triPositionBuffer:e,triTexCoordBuffer:t,normalizedCommonBounds:n,viewportCorners:r}=this.state,{viewport:i}=this.context;e.write(Ut(r,3));let a=r.map(e=>Gt(i.projectPosition(e),n));t.write(Ut(a,2))}_updateColorTexture(e){let{colorRange:t}=e.props,{colorTexture:n}=this.state,r=xe(t,!1,Uint8Array);n?.destroy(),n=this.context.device.createTexture({...pn,data:r,width:t.length,height:1}),this.setState({colorTexture:n})}_updateWeightmap(){let{radiusPixels:e,colorDomain:t,aggregation:n}=this.props,{worldBounds:r,textureSize:i,weightsScale:a,weightsTexture:o}=this.state,s=this.state.weightsTransform;this.state.isWeightMapDirty=!1;let c=this._worldToCommonBounds(r,{useLayerCoordinateSystem:!0});if(t&&n===`SUM`){let{viewport:e}=this.context,n=e.distanceScales.metersPerUnit[2]*(c[2]-c[0])/i;this.state.colorDomain=[t[0]*n*a,t[1]*n*a]}else this.state.colorDomain=t||mn;let l=this.getAttributeManager().getAttributes(),u=this.getModuleSettings();if(this._setModelAttributes(s.model,l),this.context.device.type===`webgpu`){let e=this.getNumInstances();s.model.setVertexCount(e>0?6:0),s.model.setInstanceCount(e)}else s.model.setVertexCount(this.getNumInstances());let d={radiusPixels:e,commonBounds:c,textureWidth:i,weightsScale:a,weightsTexture:o},{viewport:f,devicePixelRatio:p,coordinateSystem:m,coordinateOrigin:h}=u,{modelMatrix:g}=this.props;s.model.shaderInputs.setProps({project:{viewport:f,devicePixelRatio:p,modelMatrix:g,coordinateSystem:m,coordinateOrigin:h},weight:d}),s.run({parameters:{viewport:[0,0,i,i]},clearColor:[0,0,0,0]}),this._updateMaxWeightValue()}_debouncedUpdateWeightmap(e=!1){let{updateTimer:t}=this.state,{debounceTimeout:n}=this.props;e?(t=null,this._updateBounds(!0),this._updateTextureRenderingBounds(),this.setState({isWeightMapDirty:!0})):(this.setState({isWeightMapDirty:!1}),clearTimeout(t),t=setTimeout(this._debouncedUpdateWeightmap.bind(this,!0),n)),this.setState({updateTimer:t})}_worldToCommonBounds(e,t={}){let{useLayerCoordinateSystem:n=!1}=t,[r,i,a,o]=e,{viewport:s}=this.context,{textureSize:c}=this.state,{coordinateSystem:l}=this.props,u=n&&(l===`lnglat-offsets`||l===`meter-offsets`),d=u?s.projectPosition(this.props.coordinateOrigin):[0,0],f=c*dn/s.scale,p,m;return n&&!u?(p=this.projectPosition([r,i,0]),m=this.projectPosition([a,o,0])):(p=s.projectPosition([r,i,0]),m=s.projectPosition([a,o,0])),Wt([p[0]-d[0],p[1]-d[1],m[0]-d[0],m[1]-d[1]],f,f)}_commonToWorldBounds(e){let[t,n,r,i]=e,{viewport:a}=this.context,o=a.unprojectPosition([t,n]),s=a.unprojectPosition([r,i]);return o.slice(0,2).concat(s.slice(0,2))}};yn.layerName=`HeatmapLayer`,yn.defaultProps=gn;export{S as CPUAggregator,jt as ContourLayer,zt as GridLayer,yn as HeatmapLayer,P as HexagonLayer,ke as ScreenGridLayer,w as WebGLAggregator,T as _AggregationLayer};