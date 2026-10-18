import{r as e}from"./rolldown-runtime-hePW80VL.js";import{r as t}from"./createLucideIcon-szDhxmRU.js";import{T as n,f as r,l as i,x as a}from"./button-DRXR2maZ.js";import{t as o}from"./file-CsTGmw-K.js";var s=e(t(),1),c=new Set([`style`,`children`,`ref`,`key`,`suppressContentEditableWarning`,`suppressHydrationWarning`,`dangerouslySetInnerHTML`]),l={className:`class`,htmlFor:`for`};function u(e){return e.toLowerCase()}function d(e){if(typeof e==`boolean`)return e?``:void 0;if(typeof e!=`function`&&!(typeof e==`object`&&e))return e}function f({react:e,tagName:t,elementClass:n,events:r,displayName:i,defaultProps:a,toAttributeName:o=u,toAttributeValue:s=d}){let f=Number.parseInt(e.version)>=19,m=e.forwardRef((i,u)=>{let m=e.useRef(null),h=e.useRef(new Map),g={},_={},v={},y={};for(let[e,t]of Object.entries(i)){if(c.has(e)){v[e]=t;continue}let r=o(l[e]??e);if(n.prototype&&e in n.prototype&&!(e in(globalThis.HTMLElement?.prototype??{}))&&!n.observedAttributes?.some(e=>e===r)){y[e]=t;continue}if(e.startsWith(`on`)){g[e]=t;continue}let i=s(t);r&&i!=null&&(_[r]=String(i),f||(v[r]=i)),r&&f&&(v[r]=i===d(t)?t:i)}if(typeof window<`u`){for(let t in g){let n=g[t],i=t.endsWith(`Capture`),a=(r?.[t]??t.slice(2).toLowerCase()).slice(0,i?-7:void 0);e.useLayoutEffect(()=>{let e=m?.current;if(e&&typeof n==`function`)return e.addEventListener(a,n,i),()=>{e.removeEventListener(a,n,i)}},[m?.current,n])}e.useLayoutEffect(()=>{if(m.current===null)return;let e=new Map;for(let t in y)p(m.current,t,y[t]),h.current.delete(t),e.set(t,y[t]);for(let[e,t]of h.current)p(m.current,e,void 0);h.current=e})}if(typeof window>`u`&&n?.getTemplateHTML&&n?.shadowRootOptions){let{mode:t,delegatesFocus:r}=n.shadowRootOptions;v.children=[e.createElement(`template`,{shadowrootmode:t,shadowrootdelegatesfocus:r,dangerouslySetInnerHTML:{__html:n.getTemplateHTML(_,i)},key:`ce-la-react-ssr-template-shadow-root`}),v.children]}return e.createElement(t,{...a,...v,ref:e.useCallback(e=>{m.current=e,typeof u==`function`?u(e):u!==null&&(u.current=e)},[u])},v.children)});return m.displayName=i??n.name,m}function p(e,t,n){e[t]=n,n==null&&t in(globalThis.HTMLElement?.prototype??{})&&e.removeAttribute(t)}var m={MEDIA_PLAY_REQUEST:`mediaplayrequest`,MEDIA_PAUSE_REQUEST:`mediapauserequest`,MEDIA_MUTE_REQUEST:`mediamuterequest`,MEDIA_UNMUTE_REQUEST:`mediaunmuterequest`,MEDIA_LOOP_REQUEST:`medialooprequest`,MEDIA_VOLUME_REQUEST:`mediavolumerequest`,MEDIA_SEEK_REQUEST:`mediaseekrequest`,MEDIA_AIRPLAY_REQUEST:`mediaairplayrequest`,MEDIA_ENTER_FULLSCREEN_REQUEST:`mediaenterfullscreenrequest`,MEDIA_EXIT_FULLSCREEN_REQUEST:`mediaexitfullscreenrequest`,MEDIA_PREVIEW_REQUEST:`mediapreviewrequest`,MEDIA_ENTER_PIP_REQUEST:`mediaenterpiprequest`,MEDIA_EXIT_PIP_REQUEST:`mediaexitpiprequest`,MEDIA_ENTER_CAST_REQUEST:`mediaentercastrequest`,MEDIA_EXIT_CAST_REQUEST:`mediaexitcastrequest`,MEDIA_SHOW_TEXT_TRACKS_REQUEST:`mediashowtexttracksrequest`,MEDIA_HIDE_TEXT_TRACKS_REQUEST:`mediahidetexttracksrequest`,MEDIA_SHOW_SUBTITLES_REQUEST:`mediashowsubtitlesrequest`,MEDIA_DISABLE_SUBTITLES_REQUEST:`mediadisablesubtitlesrequest`,MEDIA_TOGGLE_SUBTITLES_REQUEST:`mediatogglesubtitlesrequest`,MEDIA_PLAYBACK_RATE_REQUEST:`mediaplaybackraterequest`,MEDIA_RENDITION_REQUEST:`mediarenditionrequest`,MEDIA_AUDIO_TRACK_REQUEST:`mediaaudiotrackrequest`,MEDIA_SEEK_TO_LIVE_REQUEST:`mediaseektoliverequest`,REGISTER_MEDIA_STATE_RECEIVER:`registermediastatereceiver`,UNREGISTER_MEDIA_STATE_RECEIVER:`unregistermediastatereceiver`},h={MEDIA_CHROME_ATTRIBUTES:`mediachromeattributes`,MEDIA_CONTROLLER:`mediacontroller`},g={MEDIA_AIRPLAY_UNAVAILABLE:`mediaAirplayUnavailable`,MEDIA_AUDIO_TRACK_ENABLED:`mediaAudioTrackEnabled`,MEDIA_AUDIO_TRACK_LIST:`mediaAudioTrackList`,MEDIA_AUDIO_TRACK_UNAVAILABLE:`mediaAudioTrackUnavailable`,MEDIA_BUFFERED:`mediaBuffered`,MEDIA_CAST_UNAVAILABLE:`mediaCastUnavailable`,MEDIA_CHAPTERS_CUES:`mediaChaptersCues`,MEDIA_CURRENT_TIME:`mediaCurrentTime`,MEDIA_DURATION:`mediaDuration`,MEDIA_ENDED:`mediaEnded`,MEDIA_ERROR:`mediaError`,MEDIA_ERROR_CODE:`mediaErrorCode`,MEDIA_ERROR_MESSAGE:`mediaErrorMessage`,MEDIA_FULLSCREEN_UNAVAILABLE:`mediaFullscreenUnavailable`,MEDIA_HAS_PLAYED:`mediaHasPlayed`,MEDIA_HEIGHT:`mediaHeight`,MEDIA_IS_AIRPLAYING:`mediaIsAirplaying`,MEDIA_IS_CASTING:`mediaIsCasting`,MEDIA_IS_FULLSCREEN:`mediaIsFullscreen`,MEDIA_IS_PIP:`mediaIsPip`,MEDIA_LOADING:`mediaLoading`,MEDIA_MUTED:`mediaMuted`,MEDIA_LOOP:`mediaLoop`,MEDIA_PAUSED:`mediaPaused`,MEDIA_PIP_UNAVAILABLE:`mediaPipUnavailable`,MEDIA_PLAYBACK_RATE:`mediaPlaybackRate`,MEDIA_PREVIEW_CHAPTER:`mediaPreviewChapter`,MEDIA_PREVIEW_COORDS:`mediaPreviewCoords`,MEDIA_PREVIEW_IMAGE:`mediaPreviewImage`,MEDIA_PREVIEW_TIME:`mediaPreviewTime`,MEDIA_RENDITION_LIST:`mediaRenditionList`,MEDIA_RENDITION_SELECTED:`mediaRenditionSelected`,MEDIA_RENDITION_UNAVAILABLE:`mediaRenditionUnavailable`,MEDIA_SEEKABLE:`mediaSeekable`,MEDIA_STREAM_TYPE:`mediaStreamType`,MEDIA_SUBTITLES_LIST:`mediaSubtitlesList`,MEDIA_SUBTITLES_SHOWING:`mediaSubtitlesShowing`,MEDIA_TARGET_LIVE_WINDOW:`mediaTargetLiveWindow`,MEDIA_TIME_IS_LIVE:`mediaTimeIsLive`,MEDIA_VOLUME:`mediaVolume`,MEDIA_VOLUME_LEVEL:`mediaVolumeLevel`,MEDIA_VOLUME_UNAVAILABLE:`mediaVolumeUnavailable`,MEDIA_LANG:`mediaLang`,MEDIA_WIDTH:`mediaWidth`},_=Object.entries(g),v=_.reduce((e,[t,n])=>(e[t]=n.toLowerCase(),e),{}),y=_.reduce((e,[t,n])=>(e[t]=n.toLowerCase(),e),{USER_INACTIVE_CHANGE:`userinactivechange`,BREAKPOINTS_CHANGE:`breakpointchange`,BREAKPOINTS_COMPUTED:`breakpointscomputed`});Object.entries(y).reduce((e,[t,n])=>{let r=v[t];return r&&(e[n]=r),e},{userinactivechange:`userinactive`});var ee=Object.entries(v).reduce((e,[t,n])=>{let r=y[t];return r&&(e[n]=r),e},{userinactive:`userinactivechange`}),b={SUBTITLES:`subtitles`,CAPTIONS:`captions`,DESCRIPTIONS:`descriptions`,CHAPTERS:`chapters`,METADATA:`metadata`},te={DISABLED:`disabled`,HIDDEN:`hidden`,SHOWING:`showing`},ne={MOUSE:`mouse`,PEN:`pen`,TOUCH:`touch`},x={UNAVAILABLE:`unavailable`,UNSUPPORTED:`unsupported`},S={LIVE:`live`,ON_DEMAND:`on-demand`,UNKNOWN:`unknown`},re={INLINE:`inline`,FULLSCREEN:`fullscreen`,PICTURE_IN_PICTURE:`picture-in-picture`};function ie(e){return e?.map(ae).join(` `)}function ae(e){if(e){let{id:t,width:n,height:r}=e;return[t,n,r].filter(e=>e!=null).join(`:`)}}function oe(e){return e?.map(se).join(` `)}function se(e){if(e){let{id:t,kind:n,language:r,label:i}=e;return[t,n,r,i].filter(e=>e!=null).join(`:`)}}function ce(e){return typeof e==`number`&&!Number.isNaN(e)&&Number.isFinite(e)}var le=e=>new Promise(t=>setTimeout(t,e)),ue={en:{"Start airplay":`Start airplay`,"Stop airplay":`Stop airplay`,Audio:`Audio`,Captions:`Captions`,"Enable captions":`Enable captions`,"Disable captions":`Disable captions`,"Start casting":`Start casting`,"Stop casting":`Stop casting`,"Enter fullscreen mode":`Enter fullscreen mode`,"Exit fullscreen mode":`Exit fullscreen mode`,Mute:`Mute`,Unmute:`Unmute`,Loop:`Loop`,"Enter picture in picture mode":`Enter picture in picture mode`,"Exit picture in picture mode":`Exit picture in picture mode`,Play:`Play`,Pause:`Pause`,"Playback rate":`Playback rate`,"Playback rate {playbackRate}":`Playback rate {playbackRate}`,Quality:`Quality`,"Seek backward":`Seek backward`,"Seek forward":`Seek forward`,Settings:`Settings`,Auto:`Auto`,"audio player":`audio player`,"video player":`video player`,volume:`volume`,seek:`seek`,"closed captions":`closed captions`,"current playback rate":`current playback rate`,"playback time":`playback time`,"media loading":`media loading`,settings:`settings`,"audio tracks":`audio tracks`,quality:`quality`,play:`play`,pause:`pause`,mute:`mute`,unmute:`unmute`,"chapter: {chapterName}":`chapter: {chapterName}`,live:`live`,Off:`Off`,"start airplay":`start airplay`,"stop airplay":`stop airplay`,"start casting":`start casting`,"stop casting":`stop casting`,"enter fullscreen mode":`enter fullscreen mode`,"exit fullscreen mode":`exit fullscreen mode`,"enter picture in picture mode":`enter picture in picture mode`,"exit picture in picture mode":`exit picture in picture mode`,"seek to live":`seek to live`,"playing live":`playing live`,"seek back {seekOffset} seconds":`seek back {seekOffset} seconds`,"seek forward {seekOffset} seconds":`seek forward {seekOffset} seconds`,"Network Error":`Network Error`,"Decode Error":`Decode Error`,"Source Not Supported":`Source Not Supported`,"Encryption Error":`Encryption Error`,"A network error caused the media download to fail.":`A network error caused the media download to fail.`,"A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.":`A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.`,"An unsupported error occurred. The server or network failed, or your browser does not support this format.":`An unsupported error occurred. The server or network failed, or your browser does not support this format.`,"The media is encrypted and there are no keys to decrypt it.":`The media is encrypted and there are no keys to decrypt it.`,hour:`hour`,hours:`hours`,minute:`minute`,minutes:`minutes`,second:`second`,seconds:`seconds`,"{time} remaining":`{time} remaining`,"{currentTime} of {totalTime}":`{currentTime} of {totalTime}`,"video not loaded, unknown time.":`video not loaded, unknown time.`}},de=globalThis.navigator?.language||`en`,fe=e=>{de=e},pe=(e,t)=>{ue[e]=t},me=e=>{let[t]=de.split(`-`);return ue[de]?.[e]||ue[t]?.[e]||ue.en?.[e]||e},he=()=>{let[e]=de.split(`-`);return ue[de]?de:ue[e]?e:`en`},C=(e,t={})=>me(e).replace(/\{(\w+)\}/g,(e,n)=>n in t?String(t[n]):`{${n}}`),ge=[{singular:`hour`,plural:`hours`},{singular:`minute`,plural:`minutes`},{singular:`second`,plural:`seconds`}],_e=(e,t)=>`${e} ${C(e===1?ge[t].singular:ge[t].plural)}`,ve=e=>{if(!ce(e))return``;let t=Math.abs(e),n=t!==e,r=new Date(0,0,0,0,0,t,0),i=[r.getHours(),r.getMinutes(),r.getSeconds()].map((e,t)=>e&&_e(e,t)).filter(e=>e).join(`, `);return n?C(`{time} remaining`,{time:i}):t===0?_e(0,2):i};function ye(e,t){let n=!1;e<0&&(n=!0,e=0-e),e=e<0?0:e;let r=Math.floor(e%60),i=Math.floor(e/60%60),a=Math.floor(e/3600),o=Math.floor(t/60%60),s=Math.floor(t/3600);return(isNaN(e)||e===1/0)&&(a=i=r=`0`),a=a>0||s>0?a+`:`:``,i=((a||o>=10)&&i<10?`0`+i:i)+`:`,r=r<10?`0`+r:r,(n?`-`:``)+a+i+r}Object.freeze({length:0,start(e){let t=e>>>0;if(t>=this.length)throw new DOMException(`Failed to execute 'start' on 'TimeRanges': The index provided (${t}) is greater than or equal to the maximum bound (${this.length}).`);return 0},end(e){let t=e>>>0;if(t>=this.length)throw new DOMException(`Failed to execute 'end' on 'TimeRanges': The index provided (${t}) is greater than or equal to the maximum bound (${this.length}).`);return 0}});var be=class{addEventListener(){}removeEventListener(){}dispatchEvent(){return!0}},xe=class extends be{},Se=class extends xe{constructor(){super(...arguments),this.role=null}},Ce=class{observe(){}unobserve(){}disconnect(){}},we={createElement:function(){return new Te.HTMLElement},createElementNS:function(){return new Te.HTMLElement},addEventListener(){},removeEventListener(){},dispatchEvent(e){return!1}},Te={ResizeObserver:Ce,document:we,Node:xe,Element:Se,HTMLElement:class extends Se{constructor(){super(...arguments),this.innerHTML=``}get content(){return new Te.DocumentFragment}},DocumentFragment:class extends be{},customElements:{get:function(){},define:function(){},whenDefined:function(){}},localStorage:{getItem(e){return null},setItem(e,t){},removeItem(e){}},CustomEvent:function(){},getComputedStyle:function(){},navigator:{languages:[],get userAgent(){return``}},matchMedia(e){return{matches:!1,media:e}},DOMParser:class{parseFromString(e,t){return{body:{textContent:e}}}}},Ee=`global`in globalThis&&(globalThis==null?void 0:globalThis.global)===globalThis||typeof window>`u`||window.customElements===void 0,De=Object.keys(Te).every(e=>e in globalThis),w=Ee&&!De?Te:globalThis,T=Ee&&!De?we:globalThis.document,Oe=new WeakMap,ke=e=>{let t=Oe.get(e);return t||Oe.set(e,t=new Set),t},Ae=new w.ResizeObserver(e=>{for(let t of e)for(let e of ke(t.target))e(t)});function je(e,t){ke(e).add(t),Ae.observe(e)}function Me(e,t){let n=ke(e);n.delete(t),n.size||Ae.unobserve(e)}function Ne(e){let t={};for(let n of e)t[n.name]=n.value;return t}function Pe(e){return Fe(e)??Be(e,`media-controller`)}function Fe(e){let{MEDIA_CONTROLLER:t}=h,n=e.getAttribute(t);if(n)return He(e)?.getElementById(n)}var Ie=(e,t,n=`.value`)=>{let r=e.querySelector(n);r&&(r.textContent=t)},Le=(e,t)=>{let n=`slot[name="${t}"]`,r=e.shadowRoot.querySelector(n);return r?r.children:[]},Re=(e,t)=>Le(e,t)[0],ze=(e,t)=>!e||!t?!1:e?.contains(t)?!0:ze(e,t.getRootNode().host),Be=(e,t)=>e?e.closest(t)||Be(e.getRootNode().host,t):null;function Ve(e=document){let t=e?.activeElement;return t?Ve(t.shadowRoot)??t:null}function He(e){let t=(e?.getRootNode)?.call(e);return t instanceof ShadowRoot||t instanceof Document?t:null}function Ue(e,{depth:t=3,checkOpacity:n=!0,checkVisibilityCSS:r=!0}={}){if(e.checkVisibility)return e.checkVisibility({checkOpacity:n,checkVisibilityCSS:r});let i=e;for(;i&&t>0;){let e=getComputedStyle(i);if(n&&e.opacity===`0`||r&&e.visibility===`hidden`||e.display===`none`)return!1;i=i.parentElement,t--}return!0}function We(e,t,n,r){let i=r.x-n.x,a=r.y-n.y,o=i*i+a*a;if(o===0)return 0;let s=((e-n.x)*i+(t-n.y)*a)/o;return Math.max(0,Math.min(1,s))}function E(e,t){return Ge(e,e=>e===t)||Ke(e,t)}function Ge(e,t){let n;for(n of e.querySelectorAll(`style:not([media])`)??[]){let e;try{e=n.sheet?.cssRules}catch{continue}for(let n of e??[])if(t(n.selectorText))return n}}function Ke(e,t){let n=e.querySelectorAll(`style:not([media])`)??[],r=n?.[n.length-1];if(!r?.sheet)return console.warn(`Media Chrome: No style sheet found on style tag of`,e),{style:{setProperty:()=>{},removeProperty:()=>``,getPropertyValue:()=>``}};let i=r?.sheet.insertRule(`${t}{}`,r.sheet.cssRules.length);return r.sheet.cssRules?.[i]}function D(e,t,n=NaN){let r=e.getAttribute(t);return r==null?n:+r}function O(e,t,n){let r=+n;n==null||Number.isNaN(r)?e.hasAttribute(t)&&e.removeAttribute(t):D(e,t,void 0)!==r&&e.setAttribute(t,`${r}`)}function k(e,t){return e.hasAttribute(t)}function A(e,t,n){n==null?e.hasAttribute(t)&&e.removeAttribute(t):k(e,t)!=n&&e.toggleAttribute(t,n)}function j(e,t,n=null){return e.getAttribute(t)??n}function M(e,t,n){if(n==null){e.hasAttribute(t)&&e.removeAttribute(t);return}let r=`${n}`;j(e,t,void 0)!==r&&e.setAttribute(t,r)}var qe=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},Je=(e,t,n)=>(qe(e,t,`read from private field`),n?n.call(e):t.get(e)),Ye=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},Xe=(e,t,n,r)=>(qe(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),N;function Ze(e){return`
    <style>
      :host {
        display: var(--media-control-display, var(--media-gesture-receiver-display, inline-block));
        box-sizing: border-box;
      }
    </style>
  `}var Qe=class extends w.HTMLElement{constructor(){if(super(),Ye(this,N,void 0),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);let e=Ne(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}}static get observedAttributes(){return[h.MEDIA_CONTROLLER,v.MEDIA_PAUSED]}attributeChangedCallback(e,t,n){var r,i,a,o;e===h.MEDIA_CONTROLLER&&(t&&((i=(r=Je(this,N))?.unassociateElement)==null||i.call(r,this),Xe(this,N,null)),n&&this.isConnected&&(Xe(this,N,this.getRootNode()?.getElementById(n)),(o=(a=Je(this,N))?.associateElement)==null||o.call(a,this)))}connectedCallback(){var e,t;this.tabIndex=-1,this.setAttribute(`aria-hidden`,`true`),Xe(this,N,$e(this)),this.getAttribute(h.MEDIA_CONTROLLER)&&((t=(e=Je(this,N))?.associateElement)==null||t.call(e,this)),Je(this,N)&&(Je(this,N).addEventListener(`pointerdown`,this),Je(this,N).addEventListener(`click`,this),Je(this,N).hasAttribute(`tabindex`)||(Je(this,N).tabIndex=0))}disconnectedCallback(){var e,t,n,r;this.getAttribute(h.MEDIA_CONTROLLER)&&((t=(e=Je(this,N))?.unassociateElement)==null||t.call(e,this)),(n=Je(this,N))==null||n.removeEventListener(`pointerdown`,this),(r=Je(this,N))==null||r.removeEventListener(`click`,this),Xe(this,N,null)}handleEvent(e){let t=e.composedPath()?.[0];if([`video`,`media-controller`].includes(t?.localName)){if(e.type===`pointerdown`)this._pointerType=e.pointerType;else if(e.type===`click`){let{clientX:t,clientY:n}=e,{left:r,top:i,width:a,height:o}=this.getBoundingClientRect(),s=t-r,c=n-i;if(s<0||c<0||s>a||c>o||a===0&&o===0)return;let l=this._pointerType||`mouse`;if(this._pointerType=void 0,l===ne.TOUCH){this.handleTap(e);return}if(l===ne.MOUSE||l===ne.PEN){this.handleMouseClick(e);return}}}}get mediaPaused(){return k(this,v.MEDIA_PAUSED)}set mediaPaused(e){A(this,v.MEDIA_PAUSED,e)}handleTap(e){}handleMouseClick(e){let t=this.mediaPaused?m.MEDIA_PLAY_REQUEST:m.MEDIA_PAUSE_REQUEST;this.dispatchEvent(new w.CustomEvent(t,{composed:!0,bubbles:!0}))}};N=new WeakMap,Qe.shadowRootOptions={mode:`open`},Qe.getTemplateHTML=Ze;function $e(e){let t=e.getAttribute(h.MEDIA_CONTROLLER);return t?e.getRootNode()?.getElementById(t):Be(e,`media-controller`)}w.customElements.get(`media-gesture-receiver`)||w.customElements.define(`media-gesture-receiver`,Qe);var et=Qe,tt=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},P=(e,t,n)=>(tt(e,t,`read from private field`),n?n.call(e):t.get(e)),F=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},nt=(e,t,n,r)=>(tt(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),rt=(e,t,n)=>(tt(e,t,`access private method`),n),it,at,ot,st,ct,lt,ut,dt,ft,pt,mt,ht,gt,_t,vt,yt,bt,xt,St,Ct,I={AUDIO:`audio`,AUTOHIDE:`autohide`,BREAKPOINTS:`breakpoints`,GESTURES_DISABLED:`gesturesdisabled`,KEYBOARD_CONTROL:`keyboardcontrol`,NO_AUTOHIDE:`noautohide`,USER_INACTIVE:`userinactive`,AUTOHIDE_OVER_CONTROLS:`autohideovercontrols`};function wt(e){return`
    <style>
      
      :host([${v.MEDIA_IS_FULLSCREEN}]) ::slotted([slot=media]) {
        outline: none;
      }

      :host {
        box-sizing: border-box;
        position: relative;
        display: inline-block;
        line-height: 0;
        background-color: var(--media-background-color, #000);
        overflow: hidden;
      }

      :host(:not([${I.AUDIO}])) [part~=layer]:not([part~=media-layer]) {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        display: flex;
        flex-flow: column nowrap;
        align-items: start;
        pointer-events: none;
        background: none;
      }

      slot[name=media] {
        display: var(--media-slot-display, contents);
      }

      
      :host([${I.AUDIO}]) slot[name=media] {
        display: var(--media-slot-display, none);
      }

      
      :host([${I.AUDIO}]) [part~=layer][part~=gesture-layer] {
        height: 0;
        display: block;
      }

      
      :host(:not([${I.AUDIO}])[${I.GESTURES_DISABLED}]) ::slotted([slot=gestures-chrome]),
          :host(:not([${I.AUDIO}])[${I.GESTURES_DISABLED}]) media-gesture-receiver[slot=gestures-chrome] {
        display: none;
      }

      
      ::slotted(:not([slot=media]):not([slot=poster]):not(media-loading-indicator):not([role=dialog]):not([hidden])) {
        pointer-events: auto;
      }

      :host(:not([${I.AUDIO}])) *[part~=layer][part~=centered-layer] {
        align-items: center;
        justify-content: center;
      }

      :host(:not([${I.AUDIO}])) ::slotted(media-gesture-receiver[slot=gestures-chrome]),
      :host(:not([${I.AUDIO}])) media-gesture-receiver[slot=gestures-chrome] {
        align-self: stretch;
        flex-grow: 1;
      }

      slot[name=middle-chrome] {
        display: inline;
        flex-grow: 1;
        pointer-events: none;
        background: none;
      }

      
      ::slotted([slot=media]),
      ::slotted([slot=poster]) {
        width: 100%;
        height: 100%;
      }

      
      :host(:not([${I.AUDIO}])) .spacer {
        flex-grow: 1;
      }

      
      :host(:-webkit-full-screen) {
        
        width: 100% !important;
        height: 100% !important;
      }

      
      ::slotted(:not([slot=media]):not([slot=poster]):not([${I.NO_AUTOHIDE}]):not([hidden]):not([role=dialog])) {
        opacity: 1;
        transition: var(--media-control-transition-in, opacity 0.25s);
      }

      
      :host([${I.USER_INACTIVE}]:not([${v.MEDIA_PAUSED}]):not([${v.MEDIA_IS_AIRPLAYING}]):not([${v.MEDIA_IS_CASTING}]):not([${I.AUDIO}])) ::slotted(:not([slot=media]):not([slot=poster]):not([${I.NO_AUTOHIDE}]):not([role=dialog])) {
        opacity: 0;
        transition: var(--media-control-transition-out, opacity 1s);
      }

      :host([${I.USER_INACTIVE}]:not([${I.NO_AUTOHIDE}]):not([${v.MEDIA_PAUSED}]):not([${v.MEDIA_IS_CASTING}]):not([${I.AUDIO}])) ::slotted([slot=media]) {
        cursor: none;
      }

      :host([${I.USER_INACTIVE}][${I.AUTOHIDE_OVER_CONTROLS}]:not([${I.NO_AUTOHIDE}]):not([${v.MEDIA_PAUSED}]):not([${v.MEDIA_IS_CASTING}]):not([${I.AUDIO}])) * {
        --media-cursor: none;
        cursor: none;
      }


      ::slotted(media-control-bar)  {
        align-self: stretch;
      }

      
      :host(:not([${I.AUDIO}])[${v.MEDIA_HAS_PLAYED}]) slot[name=poster] {
        display: none;
      }

      ::slotted([role=dialog]) {
        width: 100%;
        height: 100%;
        align-self: center;
      }

      ::slotted([role=menu]) {
        align-self: end;
      }
    </style>

    <slot name="media" part="layer media-layer"></slot>
    <slot name="poster" part="layer poster-layer"></slot>
    <slot name="gestures-chrome" part="layer gesture-layer">
      <media-gesture-receiver slot="gestures-chrome">
        <template shadowrootmode="${et.shadowRootOptions.mode}">
          ${et.getTemplateHTML({})}
        </template>
      </media-gesture-receiver>
    </slot>
    <span part="layer vertical-layer">
      <slot name="top-chrome" part="top chrome"></slot>
      <slot name="middle-chrome" part="middle chrome"></slot>
      <slot name="centered-chrome" part="layer centered-layer center centered chrome"></slot>
      
      <slot part="bottom chrome"></slot>
    </span>
    <slot name="dialog" part="layer dialog-layer"></slot>
  `}var Tt=Object.values(v),Et=`sm:384 md:576 lg:768 xl:960`;function Dt(e){Ot(e.target,e.contentRect.width)}function Ot(e,t){if(!e.isConnected)return;let n=kt(e.getAttribute(I.BREAKPOINTS)??Et),r=At(n,t),i=!1;if(Object.keys(n).forEach(t=>{r.includes(t)?e.hasAttribute(`breakpoint${t}`)||(e.setAttribute(`breakpoint${t}`,``),i=!0):e.hasAttribute(`breakpoint${t}`)&&(e.removeAttribute(`breakpoint${t}`),i=!0)}),i){let t=new CustomEvent(y.BREAKPOINTS_CHANGE,{detail:r});e.dispatchEvent(t)}e.breakpointsComputed||(e.breakpointsComputed=!0,e.dispatchEvent(new CustomEvent(y.BREAKPOINTS_COMPUTED,{bubbles:!0,composed:!0})))}function kt(e){let t=e.split(/\s+/);return Object.fromEntries(t.map(e=>e.split(`:`)))}function At(e,t){return Object.keys(e).filter(n=>t>=parseInt(e[n]))}var jt=class extends w.HTMLElement{constructor(){if(super(),F(this,ft),F(this,mt),F(this,gt),F(this,vt),F(this,bt),F(this,it,void 0),F(this,at,0),F(this,ot,null),F(this,st,null),F(this,ct,void 0),this.breakpointsComputed=!1,F(this,lt,e=>{let t=this.media;for(let n of e){if(n.type!==`childList`)continue;let e=n.removedNodes;for(let r of e){if(r.slot!=`media`||n.target!=this)continue;let e=n.previousSibling&&n.previousSibling.previousElementSibling;if(!e||!t)this.mediaUnsetCallback(r);else{let t=e.slot!==`media`;for(;(e=e.previousSibling)!==null;)e.slot==`media`&&(t=!1);t&&this.mediaUnsetCallback(r)}}if(t)for(let e of n.addedNodes)e===t&&this.handleMediaUpdated(t)}}),F(this,ut,!1),F(this,dt,e=>{P(this,ut)||(setTimeout(()=>{Dt(e),nt(this,ut,!1)},0),nt(this,ut,!0))}),F(this,St,void 0),F(this,Ct,()=>{P(this,St).assignedElements({flatten:!0}).length?this.handleMediaUpdated(this.media):P(this,ot)&&this.mediaUnsetCallback(P(this,ot))}),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);let e=Ne(this.attributes),t=this.constructor.getTemplateHTML(e);this.shadowRoot.setHTMLUnsafe?this.shadowRoot.setHTMLUnsafe(t):this.shadowRoot.innerHTML=t}nt(this,it,new MutationObserver(P(this,lt)))}static get observedAttributes(){return[I.AUTOHIDE,I.GESTURES_DISABLED].concat(Tt).filter(e=>![v.MEDIA_RENDITION_LIST,v.MEDIA_AUDIO_TRACK_LIST,v.MEDIA_CHAPTERS_CUES,v.MEDIA_WIDTH,v.MEDIA_HEIGHT,v.MEDIA_ERROR,v.MEDIA_ERROR_MESSAGE].includes(e))}attributeChangedCallback(e,t,n){e.toLowerCase()==I.AUTOHIDE&&(this.autohide=n)}get media(){let e=this.querySelector(`:scope > [slot=media]`);return e?.nodeName==`SLOT`&&(e=e.assignedElements({flatten:!0})[0]),e}async handleMediaUpdated(e){e&&(nt(this,ot,e),e.localName.includes(`-`)&&await w.customElements.whenDefined(e.localName),this.mediaSetCallback(e))}connectedCallback(){var e;P(this,it).observe(this,{childList:!0,subtree:!0}),je(this,P(this,dt));let t=this.getAttribute(I.AUDIO)==null?C(`video player`):C(`audio player`);this.setAttribute(`role`,`region`),this.setAttribute(`aria-label`,t),this.handleMediaUpdated(this.media),this.setAttribute(I.USER_INACTIVE,``),Ot(this,this.getBoundingClientRect().width);let n=this.querySelector(`:scope > slot[slot=media]`);n&&(nt(this,St,n),P(this,St).addEventListener(`slotchange`,P(this,Ct))),this.addEventListener(`pointerdown`,this),this.addEventListener(`pointermove`,this),this.addEventListener(`pointerup`,this),this.addEventListener(`mouseleave`,this),this.addEventListener(`keyup`,this),(e=w.window)==null||e.addEventListener(`mouseup`,this)}disconnectedCallback(){var e;Me(this,P(this,dt)),clearTimeout(P(this,st)),P(this,it).disconnect(),this.media&&this.mediaUnsetCallback(this.media),(e=w.window)==null||e.removeEventListener(`mouseup`,this),this.removeEventListener(`pointerdown`,this),this.removeEventListener(`pointermove`,this),this.removeEventListener(`pointerup`,this),this.removeEventListener(`mouseleave`,this),this.removeEventListener(`keyup`,this),P(this,St)&&(P(this,St).removeEventListener(`slotchange`,P(this,Ct)),nt(this,St,null)),nt(this,ut,!1)}mediaSetCallback(e){}mediaUnsetCallback(e){nt(this,ot,null)}handleEvent(e){switch(e.type){case`pointerdown`:nt(this,at,e.timeStamp);break;case`pointermove`:rt(this,ft,pt).call(this,e);break;case`pointerup`:rt(this,mt,ht).call(this,e);break;case`mouseleave`:rt(this,gt,_t).call(this);break;case`mouseup`:this.removeAttribute(I.KEYBOARD_CONTROL);break;case`keyup`:rt(this,bt,xt).call(this),this.setAttribute(I.KEYBOARD_CONTROL,``)}}set autohide(e){let t=Number(e);nt(this,ct,isNaN(t)?0:t)}get autohide(){return(P(this,ct)===void 0?2:P(this,ct)).toString()}get breakpoints(){return j(this,I.BREAKPOINTS)}set breakpoints(e){M(this,I.BREAKPOINTS,e)}get audio(){return k(this,I.AUDIO)}set audio(e){A(this,I.AUDIO,e)}get gesturesDisabled(){return k(this,I.GESTURES_DISABLED)}set gesturesDisabled(e){A(this,I.GESTURES_DISABLED,e)}get keyboardControl(){return k(this,I.KEYBOARD_CONTROL)}set keyboardControl(e){A(this,I.KEYBOARD_CONTROL,e)}get noAutohide(){return k(this,I.NO_AUTOHIDE)}set noAutohide(e){A(this,I.NO_AUTOHIDE,e)}get autohideOverControls(){return k(this,I.AUTOHIDE_OVER_CONTROLS)}set autohideOverControls(e){A(this,I.AUTOHIDE_OVER_CONTROLS,e)}get userInteractive(){return k(this,I.USER_INACTIVE)}set userInteractive(e){A(this,I.USER_INACTIVE,e)}};it=new WeakMap,at=new WeakMap,ot=new WeakMap,st=new WeakMap,ct=new WeakMap,lt=new WeakMap,ut=new WeakMap,dt=new WeakMap,ft=new WeakSet,pt=function(e){if(e.pointerType!==`mouse`&&e.timeStamp-P(this,at)<250)return;rt(this,vt,yt).call(this),clearTimeout(P(this,st));let t=this.hasAttribute(I.AUTOHIDE_OVER_CONTROLS);([this,this.media].includes(e.target)||t)&&rt(this,bt,xt).call(this)},mt=new WeakSet,ht=function(e){if(e.pointerType===`touch`){let t=!this.hasAttribute(I.USER_INACTIVE);[this,this.media].includes(e.target)&&t?rt(this,gt,_t).call(this):rt(this,bt,xt).call(this)}else e.composedPath().some(e=>[`media-play-button`,`media-fullscreen-button`].includes(e?.localName))&&rt(this,bt,xt).call(this)},gt=new WeakSet,_t=function(){if(P(this,ct)<0||this.hasAttribute(I.USER_INACTIVE))return;this.setAttribute(I.USER_INACTIVE,``);let e=new w.CustomEvent(y.USER_INACTIVE_CHANGE,{composed:!0,bubbles:!0,detail:!0});this.dispatchEvent(e)},vt=new WeakSet,yt=function(){if(!this.hasAttribute(I.USER_INACTIVE))return;this.removeAttribute(I.USER_INACTIVE);let e=new w.CustomEvent(y.USER_INACTIVE_CHANGE,{composed:!0,bubbles:!0,detail:!1});this.dispatchEvent(e)},bt=new WeakSet,xt=function(){rt(this,vt,yt).call(this),clearTimeout(P(this,st));let e=parseInt(this.autohide);e<0||nt(this,st,setTimeout(()=>{rt(this,gt,_t).call(this)},e*1e3))},St=new WeakMap,Ct=new WeakMap,jt.shadowRootOptions={mode:`open`},jt.getTemplateHTML=wt,w.customElements.get(`media-container`)||w.customElements.define(`media-container`,jt);var Mt=jt,Nt=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},L=(e,t,n)=>(Nt(e,t,`read from private field`),n?n.call(e):t.get(e)),Pt=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},Ft=(e,t,n,r)=>(Nt(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),It,Lt,Rt,zt,Bt,Vt,Ht=class{constructor(e,t,{defaultValue:n}={defaultValue:void 0}){Pt(this,Bt),Pt(this,It,void 0),Pt(this,Lt,void 0),Pt(this,Rt,void 0),Pt(this,zt,new Set),Ft(this,It,e),Ft(this,Lt,t),Ft(this,Rt,new Set(n))}[Symbol.iterator](){return L(this,Bt,Vt).values()}get length(){return L(this,Bt,Vt).size}get value(){return[...L(this,Bt,Vt)].join(` `)??``}set value(e){e!==this.value&&(Ft(this,zt,new Set),this.add(...e?.split(` `)??[]))}toString(){return this.value}item(e){return[...L(this,Bt,Vt)][e]}values(){return L(this,Bt,Vt).values()}forEach(e,t){L(this,Bt,Vt).forEach(e,t)}add(...e){var t;e.forEach(e=>L(this,zt).add(e)),(this.value!==``||L(this,It)?.hasAttribute(`${L(this,Lt)}`))&&((t=L(this,It))==null||t.setAttribute(`${L(this,Lt)}`,`${this.value}`))}remove(...e){var t;e.forEach(e=>L(this,zt).delete(e)),(t=L(this,It))==null||t.setAttribute(`${L(this,Lt)}`,`${this.value}`)}contains(e){return L(this,Bt,Vt).has(e)}toggle(e,t){return t===void 0?this.contains(e)?(this.remove(e),!1):(this.add(e),!0):t?(this.add(e),!0):(this.remove(e),!1)}replace(e,t){return this.remove(e),this.add(t),e===t}};It=new WeakMap,Lt=new WeakMap,Rt=new WeakMap,zt=new WeakMap,Bt=new WeakSet,Vt=function(){return L(this,zt).size?L(this,zt):L(this,Rt)};var Ut=(e=``)=>e.split(/\s+/),Wt=(e=``)=>{let[t,n,r]=e.split(`:`),i=r?decodeURIComponent(r):void 0;return{kind:t===`cc`?b.CAPTIONS:b.SUBTITLES,language:n,label:i}},Gt=(e=``,t={})=>Ut(e).map(e=>{let n=Wt(e);return{...t,...n}}),Kt=e=>e?Array.isArray(e)?e.map(e=>typeof e==`string`?Wt(e):e):typeof e==`string`?Gt(e):[e]:[],qt=({kind:e,label:t,language:n}={kind:`subtitles`})=>t?`${e===`captions`?`cc`:`sb`}:${n}:${encodeURIComponent(t)}`:n,Jt=(e=[])=>Array.prototype.map.call(e,qt).join(` `),Yt=(e,t)=>n=>n[e]===t,Xt=e=>{let t=Object.entries(e).map(([e,t])=>Yt(e,t));return e=>t.every(t=>t(e))},Zt=(e,t=[],n=[])=>{let r=Kt(n).map(Xt);Array.from(t).filter(e=>r.some(t=>t(e))).forEach(t=>{t.mode=e})},Qt=(e,t=()=>!0)=>{if(!e?.textTracks)return[];let n=typeof t==`function`?t:Xt(t);return Array.from(e.textTracks).filter(n)},$t=e=>!!e.mediaSubtitlesShowing?.length||e.hasAttribute(v.MEDIA_SUBTITLES_SHOWING),en=e=>{let{media:t,fullscreenElement:n}=e;try{let e=n&&`requestFullscreen`in n?`requestFullscreen`:n&&`webkitRequestFullScreen`in n?`webkitRequestFullScreen`:void 0;if(e){let t=n[e]?.call(n);if(t instanceof Promise)return t.catch(()=>{})}else t?.webkitEnterFullscreen?t.webkitEnterFullscreen():t?.requestFullscreen&&t.requestFullscreen()}catch(e){console.error(e)}},tn=`exitFullscreen`in T?`exitFullscreen`:`webkitExitFullscreen`in T?`webkitExitFullscreen`:`webkitCancelFullScreen`in T?`webkitCancelFullScreen`:void 0,nn=e=>{let{documentElement:t}=e;if(tn){let e=(t?.[tn])?.call(t);if(e instanceof Promise)return e.catch(()=>{})}},rn=`fullscreenElement`in T?`fullscreenElement`:`webkitFullscreenElement`in T?`webkitFullscreenElement`:void 0,an=e=>{let{documentElement:t,media:n}=e,r=t?.[rn];return!r&&`webkitDisplayingFullscreen`in n&&`webkitPresentationMode`in n&&n.webkitDisplayingFullscreen&&n.webkitPresentationMode===re.FULLSCREEN?n:r},on=e=>{let{media:t,documentElement:n,fullscreenElement:r=t}=e;if(!t||!n)return!1;let i=an(e);if(!i)return!1;if(i===r||i===t)return!0;if(i.localName.includes(`-`)){let e=i.shadowRoot;if(!(rn in e))return ze(i,r);for(;e?.[rn];){if(e[rn]===r)return!0;e=e[rn]?.shadowRoot}}return!1},sn=`fullscreenEnabled`in T?`fullscreenEnabled`:`webkitFullscreenEnabled`in T?`webkitFullscreenEnabled`:void 0,cn=e=>{let{documentElement:t,media:n}=e;return!!t?.[sn]||n&&`webkitSupportsFullscreen`in n},ln,un=()=>{var e;return ln||(ln=((e=T)?.createElement)?.call(e,`video`),ln)},dn=async(e=un())=>{if(!e)return!1;let t=e.volume;e.volume=t/2+.1;let n=new AbortController,r=await Promise.race([fn(e,n.signal),pn(e,t)]);return n.abort(),r},fn=(e,t)=>new Promise(n=>{e.addEventListener(`volumechange`,()=>n(!0),{signal:t})}),pn=async(e,t)=>{for(let n=0;n<10;n++){if(e.volume===t)return!1;await le(10)}return e.volume!==t},mn=/.*Version\/.*Safari\/.*/.test(w.navigator.userAgent),hn=(e=un())=>w.matchMedia(`(display-mode: standalone)`).matches&&mn?!1:typeof e?.requestPictureInPicture==`function`,gn=(e=un())=>cn({documentElement:T,media:e}),_n=gn(),vn=hn(),yn=!!w.WebKitPlaybackTargetAvailabilityEvent,bn=!!w.chrome,xn=e=>Qt(e.media,e=>[b.SUBTITLES,b.CAPTIONS].includes(e.kind)).sort((e,t)=>e.kind>=t.kind?1:-1),Sn=e=>Qt(e.media,e=>e.mode===te.SHOWING&&[b.SUBTITLES,b.CAPTIONS].includes(e.kind)),Cn=(e,t)=>{let n=xn(e),r=Sn(e),i=!!r.length;if(n.length){if(t===!1||i&&t!==!0)Zt(te.DISABLED,n,r);else if(t===!0||!i&&t!==!1){let t=n[0],{options:i}=e;if(!i?.noSubtitlesLangPref){let e=w.localStorage.getItem(`media-chrome-pref-subtitles-lang`),r=e?[e,...w.navigator.languages]:w.navigator.languages,i=n.filter(e=>r.some(t=>e.language.toLowerCase().startsWith(t.split(`-`)[0]))).sort((e,t)=>r.findIndex(t=>e.language.toLowerCase().startsWith(t.split(`-`)[0]))-r.findIndex(e=>t.language.toLowerCase().startsWith(e.split(`-`)[0])));i[0]&&(t=i[0])}let{language:a,label:o,kind:s}=t;Zt(te.DISABLED,n,r),Zt(te.SHOWING,n,[{language:a,label:o,kind:s}])}}},wn=(e,t)=>e===t?!0:e==null||t==null||typeof e!=typeof t?!1:typeof e==`number`&&Number.isNaN(e)&&Number.isNaN(t)?!0:typeof e==`object`?Array.isArray(e)?Tn(e,t):Object.entries(e).every(([e,n])=>e in t&&wn(n,t[e])):!1,Tn=(e,t)=>{let n=Array.isArray(e),r=Array.isArray(t);return n===r?n||r?e.length===t.length&&e.every((e,n)=>wn(e,t[n])):!0:!1},En=Object.values(S),Dn,On=dn().then(e=>(Dn=e,Dn)),kn=async(...e)=>{await Promise.all(e.filter(e=>e).map(async e=>{if(!(`localName`in e&&e instanceof w.HTMLElement))return;let t=e.localName;if(!t.includes(`-`))return;let n=w.customElements.get(t);n&&e instanceof n||(await w.customElements.whenDefined(t),w.customElements.upgrade(e))}))},An=new w.DOMParser,jn=e=>e&&(An.parseFromString(e,`text/html`).body.textContent||e),Mn={mediaError:{get(e,t){let{media:n}=e;if(t?.type!==`playing`)return n?.error},mediaEvents:[`emptied`,`error`,`playing`]},mediaErrorCode:{get(e,t){let{media:n}=e;if(t?.type!==`playing`)return n?.error?.code},mediaEvents:[`emptied`,`error`,`playing`]},mediaErrorMessage:{get(e,t){let{media:n}=e;if(t?.type!==`playing`)return n?.error?.message??``},mediaEvents:[`emptied`,`error`,`playing`]},mediaWidth:{get(e){let{media:t}=e;return t?.videoWidth??0},mediaEvents:[`resize`]},mediaHeight:{get(e){let{media:t}=e;return t?.videoHeight??0},mediaEvents:[`resize`]},mediaPaused:{get(e){let{media:t}=e;return t?.paused??!0},set(e,t){var n;let{media:r}=t;r&&(e?r.pause():(n=r.play())==null||n.catch(()=>{}))},mediaEvents:[`play`,`playing`,`pause`,`emptied`]},mediaHasPlayed:{get(e,t){let{media:n}=e;return n?t?t.type===`playing`:!n.paused:!1},mediaEvents:[`playing`,`emptied`]},mediaEnded:{get(e){let{media:t}=e;return t?.ended??!1},mediaEvents:[`seeked`,`ended`,`emptied`]},mediaPlaybackRate:{get(e){let{media:t}=e;return t?.playbackRate??1},set(e,t){let{media:n}=t;n&&Number.isFinite(+e)&&(n.playbackRate=+e)},mediaEvents:[`ratechange`,`loadstart`]},mediaMuted:{get(e){let{media:t}=e;return t?.muted??!1},set(e,t){let{media:n,options:{noMutedPref:r}={}}=t;if(n){n.muted=e;try{let t=w.localStorage.getItem(`media-chrome-pref-muted`)!==null,i=n.hasAttribute(`muted`);if(r){t&&w.localStorage.removeItem(`media-chrome-pref-muted`);return}if(i&&!t)return;w.localStorage.setItem(`media-chrome-pref-muted`,e?`true`:`false`)}catch(e){console.debug(`Error setting muted pref`,e)}}},mediaEvents:[`volumechange`],stateOwnersUpdateHandlers:[(e,t)=>{let{options:{noMutedPref:n}}=t,{media:r}=t;if(!(!r||r.muted||n))try{let n=w.localStorage.getItem(`media-chrome-pref-muted`)===`true`;Mn.mediaMuted.set(n,t),e(n)}catch(e){console.debug(`Error getting muted pref`,e)}}]},mediaLoop:{get(e){let{media:t}=e;return t?.loop},set(e,t){let{media:n}=t;n&&(n.loop=e)},mediaEvents:[`medialooprequest`]},mediaVolume:{get(e){let{media:t}=e;return t?.volume??1},set(e,t){let{media:n,options:{noVolumePref:r}={}}=t;if(n){try{e==null?w.localStorage.removeItem(`media-chrome-pref-volume`):!n.hasAttribute(`muted`)&&!r&&w.localStorage.setItem(`media-chrome-pref-volume`,e.toString())}catch(e){console.debug(`Error setting volume pref`,e)}Number.isFinite(+e)&&(n.volume=+e)}},mediaEvents:[`volumechange`],stateOwnersUpdateHandlers:[(e,t)=>{let{options:{noVolumePref:n}}=t;if(!n)try{let{media:n}=t;if(!n)return;let r=w.localStorage.getItem(`media-chrome-pref-volume`);if(r==null)return;Mn.mediaVolume.set(+r,t),e(+r)}catch(e){console.debug(`Error getting volume pref`,e)}}]},mediaVolumeLevel:{get(e){let{media:t}=e;return t?.volume===void 0?`high`:t.muted||t.volume===0?`off`:t.volume<.5?`low`:t.volume<.75?`medium`:`high`},mediaEvents:[`volumechange`]},mediaCurrentTime:{get(e){let{media:t}=e;return t?.currentTime??0},set(e,t){let{media:n}=t;n&&ce(e)&&(n.currentTime=e)},mediaEvents:[`timeupdate`,`loadedmetadata`,`seeking`]},mediaDuration:{get(e){let{media:t,options:{defaultDuration:n}={}}=e;return n&&(!t||!t.duration||Number.isNaN(t.duration)||!Number.isFinite(t.duration))?n:Number.isFinite(t?.duration)?t.duration:NaN},mediaEvents:[`durationchange`,`loadedmetadata`,`emptied`]},mediaLoading:{get(e){let{media:t}=e;return t?.readyState<3},mediaEvents:[`waiting`,`playing`,`emptied`]},mediaSeekable:{get(e){let{media:t}=e;if(!t?.seekable?.length)return;let n=t.seekable.start(0),r=t.seekable.end(t.seekable.length-1);if(n||r)return[Number(n.toFixed(3)),Number(r.toFixed(3))]},mediaEvents:[`loadedmetadata`,`emptied`,`progress`,`seekablechange`]},mediaBuffered:{get(e){let{media:t}=e,n=t?.buffered??[];return Array.from(n).map((e,t)=>[Number(n.start(t).toFixed(3)),Number(n.end(t).toFixed(3))])},mediaEvents:[`progress`,`emptied`]},mediaStreamType:{get(e){let{media:t,options:{defaultStreamType:n}={}}=e,r=[S.LIVE,S.ON_DEMAND].includes(n)?n:void 0;if(!t)return r;let{streamType:i}=t;if(En.includes(i))return i===S.UNKNOWN?r:i;let a=t.duration;return a===1/0?S.LIVE:Number.isFinite(a)?S.ON_DEMAND:r},mediaEvents:[`emptied`,`durationchange`,`loadedmetadata`,`streamtypechange`]},mediaTargetLiveWindow:{get(e){let{media:t}=e;if(!t)return NaN;let{targetLiveWindow:n}=t,r=Mn.mediaStreamType.get(e);return(n==null||Number.isNaN(n))&&r===S.LIVE?0:n},mediaEvents:[`emptied`,`durationchange`,`loadedmetadata`,`streamtypechange`,`targetlivewindowchange`]},mediaTimeIsLive:{get(e){let{media:t,options:{liveEdgeOffset:n=10}={}}=e;if(!t)return!1;if(typeof t.liveEdgeStart==`number`)return!Number.isNaN(t.liveEdgeStart)&&t.currentTime>=t.liveEdgeStart;if(Mn.mediaStreamType.get(e)!==S.LIVE)return!1;let r=t.seekable;if(!r)return!0;if(!r.length)return!1;let i=r.end(r.length-1)-n;return t.currentTime>=i},mediaEvents:[`playing`,`timeupdate`,`progress`,`waiting`,`emptied`]},mediaSubtitlesList:{get(e){return xn(e).map(({kind:e,label:t,language:n})=>({kind:e,label:t,language:n}))},mediaEvents:[`loadstart`],textTracksEvents:[`addtrack`,`removetrack`]},mediaSubtitlesShowing:{get(e){return Sn(e).map(({kind:e,label:t,language:n})=>({kind:e,label:t,language:n}))},mediaEvents:[`loadstart`],textTracksEvents:[`addtrack`,`removetrack`,`change`],stateOwnersUpdateHandlers:[(e,t)=>{var n,r;let{media:i,options:a}=t;if(!i)return;let o=e=>{a.defaultSubtitles&&(!e||[b.CAPTIONS,b.SUBTITLES].includes(e?.track?.kind))&&Cn(t,!0)};return i.addEventListener(`loadstart`,o),(n=i.textTracks)==null||n.addEventListener(`addtrack`,o),(r=i.textTracks)==null||r.addEventListener(`removetrack`,o),()=>{var e,t;i.removeEventListener(`loadstart`,o),(e=i.textTracks)==null||e.removeEventListener(`addtrack`,o),(t=i.textTracks)==null||t.removeEventListener(`removetrack`,o)}}]},mediaChaptersCues:{get(e){let{media:t}=e;if(!t)return[];let[n]=Qt(t,{kind:b.CHAPTERS});return Array.from(n?.cues??[]).map(({text:e,startTime:t,endTime:n})=>({text:jn(e),startTime:t,endTime:n}))},mediaEvents:[`loadstart`,`loadedmetadata`],textTracksEvents:[`addtrack`,`removetrack`,`change`],stateOwnersUpdateHandlers:[(e,t)=>{let{media:n}=t;if(!n)return;let r=n.querySelector(`track[kind="chapters"][default][src]`),i=n.shadowRoot?.querySelector(`:is(video,audio) > track[kind="chapters"][default][src]`);return r?.addEventListener(`load`,e),i?.addEventListener(`load`,e),()=>{r?.removeEventListener(`load`,e),i?.removeEventListener(`load`,e)}}]},mediaIsPip:{get(e){let{media:t,documentElement:n}=e;if(!t||!n||!n.pictureInPictureElement)return!1;if(n.pictureInPictureElement===t)return!0;if(n.pictureInPictureElement instanceof HTMLMediaElement)return t.localName?.includes(`-`)?ze(t,n.pictureInPictureElement):!1;if(n.pictureInPictureElement.localName.includes(`-`)){let e=n.pictureInPictureElement.shadowRoot;for(;e?.pictureInPictureElement;){if(e.pictureInPictureElement===t)return!0;e=e.pictureInPictureElement?.shadowRoot}}return!1},set(e,t){let{media:n}=t;if(n){if(e){if(!T.pictureInPictureEnabled){console.warn(`MediaChrome: Picture-in-picture is not enabled`);return}if(!n.requestPictureInPicture){console.warn(`MediaChrome: The current media does not support picture-in-picture`);return}let e=()=>{console.warn(`MediaChrome: The media is not ready for picture-in-picture. It must have a readyState > 0.`)};n.requestPictureInPicture().catch(t=>{if(t.code===11){if(!n.src){console.warn(`MediaChrome: The media is not ready for picture-in-picture. It must have a src set.`);return}if(n.readyState===0&&n.preload===`none`){let t=()=>{n.removeEventListener(`loadedmetadata`,r),n.preload=`none`},r=()=>{n.requestPictureInPicture().catch(e),t()};n.addEventListener(`loadedmetadata`,r),n.preload=`metadata`,setTimeout(()=>{n.readyState===0&&e(),t()},1e3)}else throw t}else throw t})}else T.pictureInPictureElement&&T.exitPictureInPicture()}},mediaEvents:[`enterpictureinpicture`,`leavepictureinpicture`]},mediaRenditionList:{get(e){let{media:t}=e;return[...t?.videoRenditions??[]].map(e=>({...e}))},mediaEvents:[`emptied`,`loadstart`],videoRenditionsEvents:[`addrendition`,`removerendition`]},mediaRenditionSelected:{get(e){let{media:t}=e;return t?.videoRenditions?.[t.videoRenditions?.selectedIndex]?.id},set(e,t){let{media:n}=t;if(!n?.videoRenditions){console.warn(`MediaController: Rendition selection not supported by this media.`);return}let r=e,i=Array.prototype.findIndex.call(n.videoRenditions,e=>e.id==r);n.videoRenditions.selectedIndex!=i&&(n.videoRenditions.selectedIndex=i)},mediaEvents:[`emptied`],videoRenditionsEvents:[`addrendition`,`removerendition`,`change`]},mediaAudioTrackList:{get(e){let{media:t}=e;return[...t?.audioTracks??[]]},mediaEvents:[`emptied`,`loadstart`],audioTracksEvents:[`addtrack`,`removetrack`]},mediaAudioTrackEnabled:{get(e){let{media:t}=e;return[...t?.audioTracks??[]].find(e=>e.enabled)?.id},set(e,t){let{media:n}=t;if(!n?.audioTracks){console.warn(`MediaChrome: Audio track selection not supported by this media.`);return}let r=e;for(let e of n.audioTracks)e.enabled=r==e.id},mediaEvents:[`emptied`],audioTracksEvents:[`addtrack`,`removetrack`,`change`]},mediaIsFullscreen:{get(e){return on(e)},set(e,t,n){var r;e?(en(t),n.detail&&!t.media?.inert&&((r=t.media)==null||r.focus())):nn(t)},rootEvents:[`fullscreenchange`,`webkitfullscreenchange`],mediaEvents:[`webkitbeginfullscreen`,`webkitendfullscreen`,`webkitpresentationmodechanged`]},mediaIsCasting:{get(e){let{media:t}=e;return!t?.remote||t.remote?.state===`disconnected`?!1:t.remote.state===`connected`},set(e,t){let{media:n}=t;n&&(e&&n.remote?.state!==`disconnected`||(e||n.remote?.state===`connected`)&&(typeof n.remote.prompt==`function`?n.remote.prompt().catch(()=>{}):console.warn(`MediaChrome: Casting is not supported in this environment`)))},remoteEvents:[`connect`,`connecting`,`disconnect`]},mediaIsAirplaying:{get(){return!1},set(e,t){let{media:n}=t;n&&(n.webkitShowPlaybackTargetPicker&&w.WebKitPlaybackTargetAvailabilityEvent?n.webkitShowPlaybackTargetPicker():console.error(`MediaChrome: received a request to select AirPlay but AirPlay is not supported in this environment`))},mediaEvents:[`webkitcurrentplaybacktargetiswirelesschanged`]},mediaFullscreenUnavailable:{get(e){let{media:t}=e;if(!_n||!gn(t))return x.UNSUPPORTED}},mediaPipUnavailable:{get(e){let{media:t}=e;if(!vn||!hn(t))return x.UNSUPPORTED;if(t?.disablePictureInPicture)return x.UNAVAILABLE}},mediaVolumeUnavailable:{get(e){let{media:t}=e;if(Dn===!1||t?.volume==null)return x.UNSUPPORTED},stateOwnersUpdateHandlers:[e=>{Dn??On.then(t=>e(t?void 0:x.UNSUPPORTED))}]},mediaCastUnavailable:{get(e,{availability:t=`not-available`}={}){let{media:n}=e;if(!bn||!n?.remote?.state)return x.UNSUPPORTED;if(t!=null&&t!==`available`)return x.UNAVAILABLE},stateOwnersUpdateHandlers:[(e,t)=>{var n;let{media:r}=t;if(r)return r.disableRemotePlayback||r.hasAttribute(`disableremoteplayback`)||(n=r?.remote)==null||n.watchAvailability(t=>{e({availability:t?`available`:`not-available`})}).catch(t=>{t.name===`NotSupportedError`?e({availability:null}):e({availability:`not-available`})}),()=>{var e;(e=r?.remote)==null||e.cancelWatchAvailability().catch(()=>{})}}]},mediaAirplayUnavailable:{get(e,t){if(!yn)return x.UNSUPPORTED;if(t?.availability===`not-available`)return x.UNAVAILABLE},mediaEvents:[`webkitplaybacktargetavailabilitychanged`],stateOwnersUpdateHandlers:[(e,t)=>{var n;let{media:r}=t;if(r)return r.disableRemotePlayback||r.hasAttribute(`disableremoteplayback`)||(n=r?.remote)==null||n.watchAvailability(t=>{e({availability:t?`available`:`not-available`})}).catch(t=>{t.name===`NotSupportedError`?e({availability:null}):e({availability:`not-available`})}),()=>{var e;(e=r?.remote)==null||e.cancelWatchAvailability().catch(()=>{})}}]},mediaRenditionUnavailable:{get(e){let{media:t}=e;if(!t?.videoRenditions)return x.UNSUPPORTED;if(!t.videoRenditions?.length)return x.UNAVAILABLE},mediaEvents:[`emptied`,`loadstart`],videoRenditionsEvents:[`addrendition`,`removerendition`]},mediaAudioTrackUnavailable:{get(e){let{media:t}=e;if(!t?.audioTracks)return x.UNSUPPORTED;if((t.audioTracks?.length??0)<=1)return x.UNAVAILABLE},mediaEvents:[`emptied`,`loadstart`],audioTracksEvents:[`addtrack`,`removetrack`]},mediaLang:{get(e){let{options:{mediaLang:t}={}}=e;return t??`en`}}},Nn={[m.MEDIA_PREVIEW_REQUEST](e,t,{detail:n}){let{media:r}=t,i=n??void 0,a,o;if(r&&i!=null){let[e]=Qt(r,{kind:b.METADATA,label:`thumbnails`}),t=Array.prototype.find.call(e?.cues??[],(e,t,n)=>t===0?e.endTime>i:t===n.length-1?e.startTime<=i:e.startTime<=i&&e.endTime>i);if(t){let e=/'^(?:[a-z]+:)?\/\//i.test(t.text)?void 0:r?.querySelector(`track[label="thumbnails"]`)?.src,n=new URL(t.text,e);o=new URLSearchParams(n.hash).get(`#xywh`).split(`,`).map(e=>+e),a=n.href}}let s=e.mediaDuration.get(t),c=e.mediaChaptersCues.get(t).find((e,t,n)=>t===n.length-1&&s===e.endTime?e.startTime<=i&&e.endTime>=i:e.startTime<=i&&e.endTime>i)?.text;return n!=null&&c==null&&(c=``),{mediaPreviewTime:i,mediaPreviewImage:a,mediaPreviewCoords:o,mediaPreviewChapter:c}},[m.MEDIA_PAUSE_REQUEST](e,t){e.mediaPaused.set(!0,t)},[m.MEDIA_PLAY_REQUEST](e,t){let n=e.mediaStreamType.get(t)===S.LIVE,r=!t.options?.noAutoSeekToLive,i=e.mediaTargetLiveWindow.get(t)>0;if(n&&r&&!i){let n=e.mediaSeekable.get(t)?.[1];if(n){let r=n-(t.options?.seekToLiveOffset??0);e.mediaCurrentTime.set(r,t)}}e.mediaPaused.set(!1,t)},[m.MEDIA_PLAYBACK_RATE_REQUEST](e,t,{detail:n}){let r=n;e.mediaPlaybackRate.set(r,t)},[m.MEDIA_MUTE_REQUEST](e,t){e.mediaMuted.set(!0,t)},[m.MEDIA_UNMUTE_REQUEST](e,t){e.mediaVolume.get(t)||e.mediaVolume.set(.25,t),e.mediaMuted.set(!1,t)},[m.MEDIA_LOOP_REQUEST](e,t,{detail:n}){let r=!!n;return e.mediaLoop.set(r,t),{mediaLoop:r}},[m.MEDIA_VOLUME_REQUEST](e,t,{detail:n}){let r=n;r&&e.mediaMuted.get(t)&&e.mediaMuted.set(!1,t),e.mediaVolume.set(r,t)},[m.MEDIA_SEEK_REQUEST](e,t,{detail:n}){let r=n;e.mediaCurrentTime.set(r,t)},[m.MEDIA_SEEK_TO_LIVE_REQUEST](e,t){let n=e.mediaSeekable.get(t)?.[1];if(Number.isNaN(Number(n)))return;let r=n-(t.options?.seekToLiveOffset??0);e.mediaCurrentTime.set(r,t)},[m.MEDIA_SHOW_SUBTITLES_REQUEST](e,t,{detail:n}){let{options:r}=t,i=xn(t),a=Kt(n),o=a[0]?.language;o&&!r.noSubtitlesLangPref&&w.localStorage.setItem(`media-chrome-pref-subtitles-lang`,o),Zt(te.SHOWING,i,a)},[m.MEDIA_DISABLE_SUBTITLES_REQUEST](e,t,{detail:n}){let r=xn(t),i=n??[];Zt(te.DISABLED,r,i)},[m.MEDIA_TOGGLE_SUBTITLES_REQUEST](e,t,{detail:n}){Cn(t,n)},[m.MEDIA_RENDITION_REQUEST](e,t,{detail:n}){let r=n;e.mediaRenditionSelected.set(r,t)},[m.MEDIA_AUDIO_TRACK_REQUEST](e,t,{detail:n}){let r=n;e.mediaAudioTrackEnabled.set(r,t)},[m.MEDIA_ENTER_PIP_REQUEST](e,t){e.mediaIsFullscreen.get(t)&&e.mediaIsFullscreen.set(!1,t),e.mediaIsPip.set(!0,t)},[m.MEDIA_EXIT_PIP_REQUEST](e,t){e.mediaIsPip.set(!1,t)},[m.MEDIA_ENTER_FULLSCREEN_REQUEST](e,t,n){e.mediaIsPip.get(t)&&e.mediaIsPip.set(!1,t),e.mediaIsFullscreen.set(!0,t,n)},[m.MEDIA_EXIT_FULLSCREEN_REQUEST](e,t){e.mediaIsFullscreen.set(!1,t)},[m.MEDIA_ENTER_CAST_REQUEST](e,t){e.mediaIsFullscreen.get(t)&&e.mediaIsFullscreen.set(!1,t),e.mediaIsCasting.set(!0,t)},[m.MEDIA_EXIT_CAST_REQUEST](e,t){e.mediaIsCasting.set(!1,t)},[m.MEDIA_AIRPLAY_REQUEST](e,t){e.mediaIsAirplaying.set(!0,t)}},Pn=({media:e,fullscreenElement:t,documentElement:n,stateMediator:r=Mn,requestMap:i=Nn,options:a={},monitorStateOwnersOnlyWithSubscriptions:o=!0})=>{let s=[],c={options:{...a}},l=Object.freeze({mediaPreviewTime:void 0,mediaPreviewImage:void 0,mediaPreviewCoords:void 0,mediaPreviewChapter:void 0}),u=e=>{e!=null&&(wn(e,l)||(l=Object.freeze({...l,...e}),s.forEach(e=>e(l))))},d=()=>{let e=Object.entries(r).reduce((e,[t,{get:n}])=>(e[t]=n(c),e),{});u(e)},f={},p,m=async(e,t)=>{let n=!!p;if(p={...c,...p??{},...e},n)return;await kn(...Object.values(e));let i=s.length>0&&t===0&&o,a=c.media!==p.media,l=c.media?.textTracks!==p.media?.textTracks,m=c.media?.videoRenditions!==p.media?.videoRenditions,h=c.media?.audioTracks!==p.media?.audioTracks,g=c.media?.remote!==p.media?.remote,_=c.documentElement!==p.documentElement,v=!!c.media&&(a||i),y=!!c.media?.textTracks&&(l||i),ee=!!c.media?.videoRenditions&&(m||i),b=!!c.media?.audioTracks&&(h||i),te=!!c.media?.remote&&(g||i),ne=!!c.documentElement&&(_||i),x=v||y||ee||b||te||ne,S=s.length===0&&t===1&&o,re=!!p.media&&(a||S),ie=!!p.media?.textTracks&&(l||S),ae=!!p.media?.videoRenditions&&(m||S),oe=!!p.media?.audioTracks&&(h||S),se=!!p.media?.remote&&(g||S),ce=!!p.documentElement&&(_||S),le=re||ie||ae||oe||se||ce;x||le?(Object.entries(r).forEach(([e,{get:t,mediaEvents:n=[],textTracksEvents:r=[],videoRenditionsEvents:i=[],audioTracksEvents:a=[],remoteEvents:o=[],rootEvents:s=[],stateOwnersUpdateHandlers:l=[]}])=>{f[e]||(f[e]={});let d=n=>{let r=t(c,n);u({[e]:r})},m;m=f[e].mediaEvents,n.forEach(t=>{m&&v&&(c.media.removeEventListener(t,m),f[e].mediaEvents=void 0),re&&(p.media.addEventListener(t,d),f[e].mediaEvents=d)}),m=f[e].textTracksEvents,r.forEach(t=>{var n,r;m&&y&&((n=c.media.textTracks)==null||n.removeEventListener(t,m),f[e].textTracksEvents=void 0),ie&&((r=p.media.textTracks)==null||r.addEventListener(t,d),f[e].textTracksEvents=d)}),m=f[e].videoRenditionsEvents,i.forEach(t=>{var n,r;m&&ee&&((n=c.media.videoRenditions)==null||n.removeEventListener(t,m),f[e].videoRenditionsEvents=void 0),ae&&((r=p.media.videoRenditions)==null||r.addEventListener(t,d),f[e].videoRenditionsEvents=d)}),m=f[e].audioTracksEvents,a.forEach(t=>{var n,r;m&&b&&((n=c.media.audioTracks)==null||n.removeEventListener(t,m),f[e].audioTracksEvents=void 0),oe&&((r=p.media.audioTracks)==null||r.addEventListener(t,d),f[e].audioTracksEvents=d)}),m=f[e].remoteEvents,o.forEach(t=>{var n,r;m&&te&&((n=c.media.remote)==null||n.removeEventListener(t,m),f[e].remoteEvents=void 0),se&&((r=p.media.remote)==null||r.addEventListener(t,d),f[e].remoteEvents=d)}),m=f[e].rootEvents,s.forEach(t=>{m&&ne&&(c.documentElement.removeEventListener(t,m),f[e].rootEvents=void 0),ce&&(p.documentElement.addEventListener(t,d),f[e].rootEvents=d)});let h=f[e].stateOwnersUpdateHandlers;if(h&&x&&(Array.isArray(h)?h:[h]).forEach(e=>{typeof e==`function`&&e()}),le){let t=l.map(e=>e(d,p)).filter(e=>typeof e==`function`);f[e].stateOwnersUpdateHandlers=t.length===1?t[0]:t}else x&&(f[e].stateOwnersUpdateHandlers=void 0)}),Object.entries(p).forEach(([e,t])=>{c[e]=t}),d(),p=void 0):(Object.entries(p).forEach(([e,t])=>{c[e]=t}),d(),p=void 0)};return m({media:e,fullscreenElement:t,documentElement:n,options:a}),{dispatch(e){let{type:t,detail:n}=e;i[t]&&l.mediaErrorCode==null?u(i[t](r,c,e)):t===`mediaelementchangerequest`?m({media:n}):t===`fullscreenelementchangerequest`?m({fullscreenElement:n}):t===`documentelementchangerequest`?m({documentElement:n}):t===`optionschangerequest`&&(Object.entries(n??{}).forEach(([e,t])=>{c.options[e]=t}),d())},getState(){return l},subscribe(e){return m({},s.length+1),s.push(e),e(l),()=>{let t=s.indexOf(e);t>=0&&(m({},s.length-1),s.splice(t,1))}}}},Fn=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},R=(e,t,n)=>(Fn(e,t,`read from private field`),n?n.call(e):t.get(e)),z=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},In=(e,t,n,r)=>(Fn(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),Ln=(e,t,n)=>(Fn(e,t,`access private method`),n),Rn,zn,B,Bn,Vn,Hn,Un,Wn,Gn,Kn,qn,Jn,Yn,Xn,Zn,Qn=[`ArrowLeft`,`ArrowRight`,`ArrowUp`,`ArrowDown`,`Enter`,` `,`f`,`m`,`k`,`c`,`l`,`j`,`>`,`<`,`p`],$n=10,er=.025,tr=.25,nr=.25,rr=2,V={DEFAULT_SUBTITLES:`defaultsubtitles`,DEFAULT_STREAM_TYPE:`defaultstreamtype`,DEFAULT_DURATION:`defaultduration`,FULLSCREEN_ELEMENT:`fullscreenelement`,HOTKEYS:`hotkeys`,KEYBOARD_BACKWARD_SEEK_OFFSET:`keyboardbackwardseekoffset`,KEYBOARD_FORWARD_SEEK_OFFSET:`keyboardforwardseekoffset`,KEYBOARD_DOWN_VOLUME_STEP:`keyboarddownvolumestep`,KEYBOARD_UP_VOLUME_STEP:`keyboardupvolumestep`,KEYS_USED:`keysused`,LANG:`lang`,LOOP:`loop`,LIVE_EDGE_OFFSET:`liveedgeoffset`,NO_AUTO_SEEK_TO_LIVE:`noautoseektolive`,NO_DEFAULT_STORE:`nodefaultstore`,NO_HOTKEYS:`nohotkeys`,NO_MUTED_PREF:`nomutedpref`,NO_SUBTITLES_LANG_PREF:`nosubtitleslangpref`,NO_VOLUME_PREF:`novolumepref`,SEEK_TO_LIVE_OFFSET:`seektoliveoffset`},ir=class extends jt{constructor(){super(),z(this,Gn),z(this,Jn),z(this,Xn),this.mediaStateReceivers=[],this.associatedElementSubscriptions=new Map,z(this,Rn,new Ht(this,V.HOTKEYS)),z(this,zn,void 0),z(this,B,void 0),z(this,Bn,null),z(this,Vn,void 0),z(this,Hn,void 0),z(this,Un,e=>{var t;(t=R(this,B))==null||t.dispatch(e)}),z(this,Wn,void 0),z(this,qn,e=>{let{key:t,shiftKey:n}=e;n&&(t===`/`||t===`?`)||Qn.includes(t)?this.keyboardShortcutHandler(e):this.removeEventListener(`keyup`,R(this,qn))}),this.associateElement(this);let e={};In(this,Vn,t=>{Object.entries(t).forEach(([t,n])=>{if(t in e&&e[t]===n)return;this.propagateMediaState(t,n);let r=t.toLowerCase(),i=new w.CustomEvent(ee[r],{composed:!0,detail:n});this.dispatchEvent(i)}),e=t})}static get observedAttributes(){return super.observedAttributes.concat(V.NO_HOTKEYS,V.HOTKEYS,V.DEFAULT_STREAM_TYPE,V.DEFAULT_SUBTITLES,V.DEFAULT_DURATION,V.NO_MUTED_PREF,V.NO_VOLUME_PREF,V.LANG,V.LOOP,V.LIVE_EDGE_OFFSET,V.SEEK_TO_LIVE_OFFSET,V.NO_AUTO_SEEK_TO_LIVE)}get mediaStore(){return R(this,B)}set mediaStore(e){var t;R(this,B)&&((t=R(this,Hn))==null||t.call(this),In(this,Hn,void 0)),In(this,B,e),!R(this,B)&&!this.hasAttribute(V.NO_DEFAULT_STORE)?Ln(this,Gn,Kn).call(this):In(this,Hn,R(this,B)?.subscribe(R(this,Vn)))}get fullscreenElement(){return R(this,zn)??this}set fullscreenElement(e){var t;this.hasAttribute(V.FULLSCREEN_ELEMENT)&&this.removeAttribute(V.FULLSCREEN_ELEMENT),In(this,zn,e),(t=R(this,B))==null||t.dispatch({type:`fullscreenelementchangerequest`,detail:this.fullscreenElement})}get defaultSubtitles(){return k(this,V.DEFAULT_SUBTITLES)}set defaultSubtitles(e){A(this,V.DEFAULT_SUBTITLES,e)}get defaultStreamType(){return j(this,V.DEFAULT_STREAM_TYPE)}set defaultStreamType(e){M(this,V.DEFAULT_STREAM_TYPE,e)}get defaultDuration(){return D(this,V.DEFAULT_DURATION)}set defaultDuration(e){O(this,V.DEFAULT_DURATION,e)}get noHotkeys(){return k(this,V.NO_HOTKEYS)}set noHotkeys(e){A(this,V.NO_HOTKEYS,e)}get keysUsed(){return j(this,V.KEYS_USED)}set keysUsed(e){M(this,V.KEYS_USED,e)}get liveEdgeOffset(){return D(this,V.LIVE_EDGE_OFFSET)}set liveEdgeOffset(e){O(this,V.LIVE_EDGE_OFFSET,e)}get noAutoSeekToLive(){return k(this,V.NO_AUTO_SEEK_TO_LIVE)}set noAutoSeekToLive(e){A(this,V.NO_AUTO_SEEK_TO_LIVE,e)}get noVolumePref(){return k(this,V.NO_VOLUME_PREF)}set noVolumePref(e){A(this,V.NO_VOLUME_PREF,e)}get noMutedPref(){return k(this,V.NO_MUTED_PREF)}set noMutedPref(e){A(this,V.NO_MUTED_PREF,e)}get noSubtitlesLangPref(){return k(this,V.NO_SUBTITLES_LANG_PREF)}set noSubtitlesLangPref(e){A(this,V.NO_SUBTITLES_LANG_PREF,e)}get noDefaultStore(){return k(this,V.NO_DEFAULT_STORE)}set noDefaultStore(e){A(this,V.NO_DEFAULT_STORE,e)}get resolvedLang(){return he()}attributeChangedCallback(e,t,n){var r,i,a,o,s,c,l,u,d,f;if(super.attributeChangedCallback(e,t,n),e===V.NO_HOTKEYS)n!==t&&n===``?(this.hasAttribute(V.HOTKEYS)&&console.warn("Media Chrome: Both `hotkeys` and `nohotkeys` have been set. All hotkeys will be disabled."),this.disableHotkeys()):n!==t&&n===null&&this.enableHotkeys();else if(e===V.HOTKEYS)R(this,Rn).value=n;else if(e===V.DEFAULT_SUBTITLES&&n!==t)(r=R(this,B))==null||r.dispatch({type:`optionschangerequest`,detail:{defaultSubtitles:this.hasAttribute(V.DEFAULT_SUBTITLES)}});else if(e===V.DEFAULT_STREAM_TYPE)(i=R(this,B))==null||i.dispatch({type:`optionschangerequest`,detail:{defaultStreamType:this.getAttribute(V.DEFAULT_STREAM_TYPE)??void 0}});else if(e===V.LIVE_EDGE_OFFSET&&n!==t)(a=R(this,B))==null||a.dispatch({type:`optionschangerequest`,detail:{liveEdgeOffset:this.hasAttribute(V.LIVE_EDGE_OFFSET)?+this.getAttribute(V.LIVE_EDGE_OFFSET):void 0,seekToLiveOffset:this.hasAttribute(V.SEEK_TO_LIVE_OFFSET)?+this.getAttribute(V.SEEK_TO_LIVE_OFFSET):this.hasAttribute(V.LIVE_EDGE_OFFSET)?+this.getAttribute(V.LIVE_EDGE_OFFSET):void 0}});else if(e===V.SEEK_TO_LIVE_OFFSET&&n!==t)(o=R(this,B))==null||o.dispatch({type:`optionschangerequest`,detail:{seekToLiveOffset:this.hasAttribute(V.SEEK_TO_LIVE_OFFSET)?+this.getAttribute(V.SEEK_TO_LIVE_OFFSET):this.hasAttribute(V.LIVE_EDGE_OFFSET)?+this.getAttribute(V.LIVE_EDGE_OFFSET):void 0}});else if(e===V.NO_AUTO_SEEK_TO_LIVE)(s=R(this,B))==null||s.dispatch({type:`optionschangerequest`,detail:{noAutoSeekToLive:this.hasAttribute(V.NO_AUTO_SEEK_TO_LIVE)}});else if(e===V.FULLSCREEN_ELEMENT){let e=n?this.getRootNode()?.getElementById(n):void 0;In(this,zn,e),(c=R(this,B))==null||c.dispatch({type:`fullscreenelementchangerequest`,detail:this.fullscreenElement})}else e===V.LANG&&n!==t?(fe(n),(l=R(this,B))==null||l.dispatch({type:`optionschangerequest`,detail:{mediaLang:n}})):e===V.LOOP&&n!==t?(u=R(this,B))==null||u.dispatch({type:m.MEDIA_LOOP_REQUEST,detail:n!=null}):e===V.NO_VOLUME_PREF&&n!==t?(d=R(this,B))==null||d.dispatch({type:`optionschangerequest`,detail:{noVolumePref:this.hasAttribute(V.NO_VOLUME_PREF)}}):e===V.NO_MUTED_PREF&&n!==t&&((f=R(this,B))==null||f.dispatch({type:`optionschangerequest`,detail:{noMutedPref:this.hasAttribute(V.NO_MUTED_PREF)}}))}connectedCallback(){var e,t;this.associateElement(this),!R(this,B)&&!this.hasAttribute(V.NO_DEFAULT_STORE)&&Ln(this,Gn,Kn).call(this),(e=R(this,B))==null||e.dispatch({type:`documentelementchangerequest`,detail:T}),(t=R(this,B))==null||t.dispatch({type:`fullscreenelementchangerequest`,detail:this.fullscreenElement}),super.connectedCallback(),R(this,B)&&!R(this,Hn)&&In(this,Hn,R(this,B)?.subscribe(R(this,Vn))),R(this,Wn)!==void 0&&R(this,B)&&this.media&&setTimeout(()=>{var e;this.media?.textTracks?.length&&((e=R(this,B))==null||e.dispatch({type:m.MEDIA_TOGGLE_SUBTITLES_REQUEST,detail:R(this,Wn)}))},0),this.hasAttribute(V.NO_HOTKEYS)?this.disableHotkeys():this.enableHotkeys()}disconnectedCallback(){var e,t,n,r,i;if((e=super.disconnectedCallback)==null||e.call(this),this.disableHotkeys(),R(this,B)){let e=R(this,B).getState();In(this,Wn,!!e.mediaSubtitlesShowing?.length),(t=R(this,B))==null||t.dispatch({type:`fullscreenelementchangerequest`,detail:void 0}),(n=R(this,B))==null||n.dispatch({type:`documentelementchangerequest`,detail:void 0}),(r=R(this,B))==null||r.dispatch({type:m.MEDIA_TOGGLE_SUBTITLES_REQUEST,detail:!1})}R(this,Hn)&&((i=R(this,Hn))==null||i.call(this),In(this,Hn,void 0)),this.unassociateElement(this),R(this,Bn)&&(R(this,Bn).remove(),In(this,Bn,null))}mediaSetCallback(e){var t;super.mediaSetCallback(e),(t=R(this,B))==null||t.dispatch({type:`mediaelementchangerequest`,detail:e}),e.hasAttribute(`tabindex`)||(e.tabIndex=-1)}mediaUnsetCallback(e){var t;super.mediaUnsetCallback(e),(t=R(this,B))==null||t.dispatch({type:`mediaelementchangerequest`,detail:void 0})}propagateMediaState(e,t){hr(this.mediaStateReceivers,e,t)}associateElement(e){if(!e)return;let{associatedElementSubscriptions:t}=this;if(t.has(e))return;let n=gr(e,this.registerMediaStateReceiver.bind(this),this.unregisterMediaStateReceiver.bind(this));Object.values(m).forEach(t=>{e.addEventListener(t,R(this,Un))}),t.set(e,n)}unassociateElement(e){if(!e)return;let{associatedElementSubscriptions:t}=this;t.has(e)&&(t.get(e)(),t.delete(e),Object.values(m).forEach(t=>{e.removeEventListener(t,R(this,Un))}))}registerMediaStateReceiver(e){if(!e)return;let t=this.mediaStateReceivers;t.indexOf(e)>-1||(t.push(e),R(this,B)&&Object.entries(R(this,B).getState()).forEach(([t,n])=>{hr([e],t,n)}))}unregisterMediaStateReceiver(e){let t=this.mediaStateReceivers,n=t.indexOf(e);n<0||t.splice(n,1)}enableHotkeys(){this.addEventListener(`keydown`,Ln(this,Jn,Yn))}disableHotkeys(){this.removeEventListener(`keydown`,Ln(this,Jn,Yn)),this.removeEventListener(`keyup`,R(this,qn))}get hotkeys(){return R(this,Rn)}set hotkeys(e){M(this,V.HOTKEYS,e)}keyboardShortcutHandler(e){let t=e.target;if((t.getAttribute(V.KEYS_USED)?.split(` `)??t?.keysUsed??[]).map(e=>e===`Space`?` `:e).filter(Boolean).includes(e.key))return;let n,r,i;if(!R(this,Rn).contains(`no${e.key.toLowerCase()}`)&&!(e.key===` `&&R(this,Rn).contains(`nospace`))&&(!e.shiftKey||e.key!==`/`&&e.key!==`?`||!R(this,Rn).contains(`noshift+/`)))switch(e.key){case` `:case`k`:n=R(this,B).getState().mediaPaused?m.MEDIA_PLAY_REQUEST:m.MEDIA_PAUSE_REQUEST,this.dispatchEvent(new w.CustomEvent(n,{composed:!0,bubbles:!0}));break;case`m`:n=this.mediaStore.getState().mediaVolumeLevel===`off`?m.MEDIA_UNMUTE_REQUEST:m.MEDIA_MUTE_REQUEST,this.dispatchEvent(new w.CustomEvent(n,{composed:!0,bubbles:!0}));break;case`f`:n=this.mediaStore.getState().mediaIsFullscreen?m.MEDIA_EXIT_FULLSCREEN_REQUEST:m.MEDIA_ENTER_FULLSCREEN_REQUEST,this.dispatchEvent(new w.CustomEvent(n,{composed:!0,bubbles:!0}));break;case`c`:this.dispatchEvent(new w.CustomEvent(m.MEDIA_TOGGLE_SUBTITLES_REQUEST,{composed:!0,bubbles:!0}));break;case`ArrowLeft`:case`j`:{let e=this.hasAttribute(V.KEYBOARD_BACKWARD_SEEK_OFFSET)?+this.getAttribute(V.KEYBOARD_BACKWARD_SEEK_OFFSET):$n;r=Math.max((this.mediaStore.getState().mediaCurrentTime??0)-e,0),i=new w.CustomEvent(m.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:r}),this.dispatchEvent(i);break}case`ArrowRight`:case`l`:{let e=this.hasAttribute(V.KEYBOARD_FORWARD_SEEK_OFFSET)?+this.getAttribute(V.KEYBOARD_FORWARD_SEEK_OFFSET):$n;r=Math.max((this.mediaStore.getState().mediaCurrentTime??0)+e,0),i=new w.CustomEvent(m.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:r}),this.dispatchEvent(i);break}case`ArrowUp`:{let e=this.hasAttribute(V.KEYBOARD_UP_VOLUME_STEP)?+this.getAttribute(V.KEYBOARD_UP_VOLUME_STEP):er;r=Math.min((this.mediaStore.getState().mediaVolume??1)+e,1),i=new w.CustomEvent(m.MEDIA_VOLUME_REQUEST,{composed:!0,bubbles:!0,detail:r}),this.dispatchEvent(i);break}case`ArrowDown`:{let e=this.hasAttribute(V.KEYBOARD_DOWN_VOLUME_STEP)?+this.getAttribute(V.KEYBOARD_DOWN_VOLUME_STEP):er;r=Math.max((this.mediaStore.getState().mediaVolume??1)-e,0),i=new w.CustomEvent(m.MEDIA_VOLUME_REQUEST,{composed:!0,bubbles:!0,detail:r}),this.dispatchEvent(i);break}case`<`:{let e=this.mediaStore.getState().mediaPlaybackRate??1;r=Math.max(e-tr,nr).toFixed(2),i=new w.CustomEvent(m.MEDIA_PLAYBACK_RATE_REQUEST,{composed:!0,bubbles:!0,detail:r}),this.dispatchEvent(i);break}case`>`:{let e=this.mediaStore.getState().mediaPlaybackRate??1;r=Math.min(e+tr,rr).toFixed(2),i=new w.CustomEvent(m.MEDIA_PLAYBACK_RATE_REQUEST,{composed:!0,bubbles:!0,detail:r}),this.dispatchEvent(i);break}case`/`:case`?`:e.shiftKey&&Ln(this,Xn,Zn).call(this);break;case`p`:n=this.mediaStore.getState().mediaIsPip?m.MEDIA_EXIT_PIP_REQUEST:m.MEDIA_ENTER_PIP_REQUEST,i=new w.CustomEvent(n,{composed:!0,bubbles:!0}),this.dispatchEvent(i)}}};Rn=new WeakMap,zn=new WeakMap,B=new WeakMap,Bn=new WeakMap,Vn=new WeakMap,Hn=new WeakMap,Un=new WeakMap,Wn=new WeakMap,Gn=new WeakSet,Kn=function(){this.mediaStore=Pn({media:this.media,fullscreenElement:this.fullscreenElement,options:{defaultSubtitles:this.hasAttribute(V.DEFAULT_SUBTITLES),defaultDuration:this.hasAttribute(V.DEFAULT_DURATION)?+this.getAttribute(V.DEFAULT_DURATION):void 0,defaultStreamType:this.getAttribute(V.DEFAULT_STREAM_TYPE)??void 0,liveEdgeOffset:this.hasAttribute(V.LIVE_EDGE_OFFSET)?+this.getAttribute(V.LIVE_EDGE_OFFSET):void 0,seekToLiveOffset:this.hasAttribute(V.SEEK_TO_LIVE_OFFSET)?+this.getAttribute(V.SEEK_TO_LIVE_OFFSET):this.hasAttribute(V.LIVE_EDGE_OFFSET)?+this.getAttribute(V.LIVE_EDGE_OFFSET):void 0,noAutoSeekToLive:this.hasAttribute(V.NO_AUTO_SEEK_TO_LIVE),noVolumePref:this.hasAttribute(V.NO_VOLUME_PREF),noMutedPref:this.hasAttribute(V.NO_MUTED_PREF),noSubtitlesLangPref:this.hasAttribute(V.NO_SUBTITLES_LANG_PREF)}})},qn=new WeakMap,Jn=new WeakSet,Yn=function(e){let{metaKey:t,altKey:n,key:r,shiftKey:i}=e,a=i&&(r===`/`||r===`?`);if(a&&R(this,Bn)?.open||t||n||!a&&!Qn.includes(r)){this.removeEventListener(`keyup`,R(this,qn));return}let o=e.target,s=o instanceof HTMLElement&&(o.tagName.toLowerCase()===`media-volume-range`||o.tagName.toLowerCase()===`media-time-range`);[` `,`ArrowLeft`,`ArrowRight`,`ArrowUp`,`ArrowDown`].includes(r)&&!(R(this,Rn).contains(`no${r.toLowerCase()}`)||r===` `&&R(this,Rn).contains(`nospace`))&&!s&&e.preventDefault(),this.addEventListener(`keyup`,R(this,qn),{once:!0})},Xn=new WeakSet,Zn=function(){R(this,Bn)||(In(this,Bn,T.createElement(`media-keyboard-shortcuts-dialog`)),this.appendChild(R(this,Bn))),R(this,Bn).open=!0};var ar=Object.values(v),or=Object.values(g),sr=e=>{var t;let{observedAttributes:n}=e.constructor;!n&&e.nodeName?.includes(`-`)&&(w.customElements.upgrade(e),{observedAttributes:n}=e.constructor);let r=((t=(e?.getAttribute)?.call(e,h.MEDIA_CHROME_ATTRIBUTES))?.split)?.call(t,/\s+/);return Array.isArray(n||r)?(n||r).filter(e=>ar.includes(e)):[]},cr=e=>(e.nodeName?.includes(`-`)&&w.customElements.get(e.nodeName?.toLowerCase())&&!(e instanceof w.customElements.get(e.nodeName.toLowerCase()))&&w.customElements.upgrade(e),or.some(t=>t in e)),lr=e=>cr(e)||!!sr(e).length,ur=e=>(e?.join)?.call(e,`:`),dr={[v.MEDIA_SUBTITLES_LIST]:Jt,[v.MEDIA_SUBTITLES_SHOWING]:Jt,[v.MEDIA_SEEKABLE]:ur,[v.MEDIA_BUFFERED]:e=>e?.map(ur).join(` `),[v.MEDIA_PREVIEW_COORDS]:e=>e?.join(` `),[v.MEDIA_RENDITION_LIST]:ie,[v.MEDIA_AUDIO_TRACK_LIST]:oe},fr=async(e,t,n)=>{if(e.isConnected||await le(0),typeof n==`boolean`||n==null)return A(e,t,n);if(typeof n==`number`)return O(e,t,n);if(typeof n==`string`)return M(e,t,n);if(Array.isArray(n)&&!n.length)return e.removeAttribute(t);let r=dr[t]?.call(dr,n)??n;return e.setAttribute(t,r)},pr=e=>!!e.closest?.call(e,`*[slot="media"]`),mr=(e,t)=>{if(pr(e))return;let n=(e,t)=>{lr(e)&&t(e);let{children:n=[]}=e??{},r=e?.shadowRoot?.children??[];[...n,...r].forEach(e=>mr(e,t))},r=e?.nodeName.toLowerCase();r.includes(`-`)&&!lr(e)?w.customElements.whenDefined(r).then(()=>{n(e,t)}):n(e,t)},hr=(e,t,n)=>{e.forEach(e=>{if(t in e){e[t]=n;return}let r=sr(e),i=t.toLowerCase();r.includes(i)&&fr(e,i,n)})},gr=(e,t,n)=>{mr(e,t);let r=e=>{t(e?.composedPath()[0]??e.target)},i=e=>{n(e?.composedPath()[0]??e.target)};e.addEventListener(m.REGISTER_MEDIA_STATE_RECEIVER,r),e.addEventListener(m.UNREGISTER_MEDIA_STATE_RECEIVER,i);let a=e=>{e.forEach(e=>{let{addedNodes:r=[],removedNodes:i=[],type:a,target:o,attributeName:s}=e;a===`childList`?(Array.prototype.forEach.call(r,e=>mr(e,t)),Array.prototype.forEach.call(i,e=>mr(e,n))):a===`attributes`&&s===h.MEDIA_CHROME_ATTRIBUTES&&(lr(o)?t(o):n(o))})},o=[],s=e=>{let r=e.target;r.name!==`media`&&(o.forEach(e=>mr(e,n)),o=[...r.assignedElements({flatten:!0})],o.forEach(e=>mr(e,t)))};e.addEventListener(`slotchange`,s);let c=new MutationObserver(a);return c.observe(e,{childList:!0,attributes:!0,subtree:!0}),()=>{mr(e,n),e.removeEventListener(`slotchange`,s),c.disconnect(),e.removeEventListener(m.REGISTER_MEDIA_STATE_RECEIVER,r),e.removeEventListener(m.UNREGISTER_MEDIA_STATE_RECEIVER,i)}};w.customElements.get(`media-controller`)||w.customElements.define(`media-controller`,ir);var _r=ir,vr={PLACEMENT:`placement`,BOUNDS:`bounds`};function yr(e){return`
    <style>
      :host {
        --_tooltip-background-color: var(--media-tooltip-background-color, var(--media-secondary-color, rgba(20, 20, 30, .7)));
        --_tooltip-background: var(--media-tooltip-background, var(--_tooltip-background-color));
        --_tooltip-arrow-half-width: calc(var(--media-tooltip-arrow-width, 12px) / 2);
        --_tooltip-arrow-height: var(--media-tooltip-arrow-height, 5px);
        --_tooltip-arrow-background: var(--media-tooltip-arrow-color, var(--_tooltip-background-color));
        position: relative;
        pointer-events: none;
        display: var(--media-tooltip-display, inline-flex);
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        z-index: var(--media-tooltip-z-index, 1);
        background: var(--_tooltip-background);
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        font: var(--media-font,
          var(--media-font-weight, 400)
          var(--media-font-size, 13px) /
          var(--media-text-content-height, var(--media-control-height, 18px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        padding: var(--media-tooltip-padding, .35em .7em);
        border: var(--media-tooltip-border, none);
        border-radius: var(--media-tooltip-border-radius, 5px);
        filter: var(--media-tooltip-filter, drop-shadow(0 0 4px rgba(0, 0, 0, .2)));
        white-space: var(--media-tooltip-white-space, nowrap);
      }

      :host([hidden]) {
        display: none;
      }

      img, svg {
        display: inline-block;
      }

      #arrow {
        position: absolute;
        width: 0px;
        height: 0px;
        border-style: solid;
        display: var(--media-tooltip-arrow-display, block);
      }

      :host(:not([placement])),
      :host([placement="top"]) {
        position: absolute;
        bottom: calc(100% + var(--media-tooltip-distance, 12px));
        left: 50%;
        transform: translate(calc(-50% - var(--media-tooltip-offset-x, 0px)), 0);
      }
      :host(:not([placement])) #arrow,
      :host([placement="top"]) #arrow {
        top: 100%;
        left: 50%;
        border-width: var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width) 0 var(--_tooltip-arrow-half-width);
        border-color: var(--_tooltip-arrow-background) transparent transparent transparent;
        transform: translate(calc(-50% + var(--media-tooltip-offset-x, 0px)), 0);
      }

      :host([placement="right"]) {
        position: absolute;
        left: calc(100% + var(--media-tooltip-distance, 12px));
        top: 50%;
        transform: translate(0, -50%);
      }
      :host([placement="right"]) #arrow {
        top: 50%;
        right: 100%;
        border-width: var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width) 0;
        border-color: transparent var(--_tooltip-arrow-background) transparent transparent;
        transform: translate(0, -50%);
      }

      :host([placement="bottom"]) {
        position: absolute;
        top: calc(100% + var(--media-tooltip-distance, 12px));
        left: 50%;
        transform: translate(calc(-50% - var(--media-tooltip-offset-x, 0px)), 0);
      }
      :host([placement="bottom"]) #arrow {
        bottom: 100%;
        left: 50%;
        border-width: 0 var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width);
        border-color: transparent transparent var(--_tooltip-arrow-background) transparent;
        transform: translate(calc(-50% + var(--media-tooltip-offset-x, 0px)), 0);
      }

      :host([placement="left"]) {
        position: absolute;
        right: calc(100% + var(--media-tooltip-distance, 12px));
        top: 50%;
        transform: translate(0, -50%);
      }
      :host([placement="left"]) #arrow {
        top: 50%;
        left: 100%;
        border-width: var(--_tooltip-arrow-half-width) 0 var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height);
        border-color: transparent transparent transparent var(--_tooltip-arrow-background);
        transform: translate(0, -50%);
      }
      
      :host([placement="none"]) #arrow {
        display: none;
      }
    </style>
    <slot></slot>
    <div id="arrow"></div>
  `}var br=class extends w.HTMLElement{constructor(){if(super(),this.updateXOffset=()=>{if(!Ue(this,{checkOpacity:!1,checkVisibilityCSS:!1}))return;let e=this.placement;if(e===`left`||e===`right`){this.style.removeProperty(`--media-tooltip-offset-x`);return}let t=getComputedStyle(this),n=Be(this,`#`+this.bounds)??Pe(this);if(!n)return;let{x:r,width:i}=n.getBoundingClientRect(),{x:a,width:o}=this.getBoundingClientRect(),s=a+o,c=r+i,l=t.getPropertyValue(`--media-tooltip-offset-x`),u=l?parseFloat(l.replace(`px`,``)):0,d=t.getPropertyValue(`--media-tooltip-container-margin`),f=d?parseFloat(d.replace(`px`,``)):0,p=a-r+u-f,m=s-c+u+f;p<0?this.style.setProperty(`--media-tooltip-offset-x`,`${p}px`):m>0?this.style.setProperty(`--media-tooltip-offset-x`,`${m}px`):this.style.removeProperty(`--media-tooltip-offset-x`)},!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);let e=Ne(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}if(this.arrowEl=this.shadowRoot.querySelector(`#arrow`),Object.prototype.hasOwnProperty.call(this,`placement`)){let e=this.placement;delete this.placement,this.placement=e}}static get observedAttributes(){return[vr.PLACEMENT,vr.BOUNDS]}get placement(){return j(this,vr.PLACEMENT)}set placement(e){M(this,vr.PLACEMENT,e)}get bounds(){return j(this,vr.BOUNDS)}set bounds(e){M(this,vr.BOUNDS,e)}};br.shadowRootOptions={mode:`open`},br.getTemplateHTML=yr,w.customElements.get(`media-tooltip`)||w.customElements.define(`media-tooltip`,br);var xr=br,Sr=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},H=(e,t,n)=>(Sr(e,t,`read from private field`),n?n.call(e):t.get(e)),Cr=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},wr=(e,t,n,r)=>(Sr(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),Tr=(e,t,n)=>(Sr(e,t,`access private method`),n),Er,Dr,Or,kr,Ar,jr,Mr,Nr={TOOLTIP_PLACEMENT:`tooltipplacement`,DISABLED:`disabled`,NO_TOOLTIP:`notooltip`};function Pr(e,t={}){return`
    <style>
      :host {
        position: relative;
        font: var(--media-font,
          var(--media-font-weight, bold)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        padding: var(--media-button-padding, var(--media-control-padding, 10px));
        justify-content: var(--media-button-justify-content, center);
        display: inline-flex;
        align-items: center;
        vertical-align: middle;
        box-sizing: border-box;
        transition: background .15s linear;
        pointer-events: auto;
        cursor: var(--media-cursor, pointer);
        -webkit-tap-highlight-color: transparent;
      }

      
      :host(:focus-visible) {
        box-shadow: var(--media-focus-box-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
        outline: 0;
      }
      
      :host(:where(:focus)) {
        box-shadow: none;
        outline: 0;
      }

      :host(:hover) {
        background: var(--media-control-hover-background, rgba(50 50 70 / .7));
      }

      slot[name="icon"] {
        display: inline-flex;
        align-items: center;
      }

      svg, img, ::slotted(svg), ::slotted(img) {
        width: var(--media-button-icon-width);
        height: var(--media-button-icon-height, var(--media-control-height, 24px));
        transform: var(--media-button-icon-transform);
        transition: var(--media-button-icon-transition);
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        vertical-align: middle;
        max-width: 100%;
        max-height: 100%;
        min-width: 100%;
      }

      media-tooltip {
        
        max-width: 0;
        overflow-x: clip;
        opacity: 0;
        transition: opacity .3s, max-width 0s 9s;
      }

      :host(:hover) media-tooltip,
      :host(:focus-visible) media-tooltip {
        max-width: 100vw;
        opacity: 1;
        transition: opacity .3s;
      }

      :host([notooltip]) slot[name="tooltip"] {
        display: none;
      }
    </style>

    ${this.getSlotTemplateHTML(e,t)}

    <slot name="tooltip">
      <media-tooltip part="tooltip" aria-hidden="true">
        <template shadowrootmode="${xr.shadowRootOptions.mode}">
          ${xr.getTemplateHTML({})}
        </template>
        <slot name="tooltip-content">
          ${this.getTooltipContentHTML(e)}
        </slot>
      </media-tooltip>
    </slot>
  `}function Fr(e,t){return`
    <slot></slot>
  `}function Ir(){return``}var U=class extends w.HTMLElement{constructor(){if(super(),Cr(this,jr),Cr(this,Er,void 0),this.preventClick=!1,this.tooltipEl=null,Cr(this,Dr,e=>{this.preventClick||this.handleClick(e),setTimeout(H(this,Or),0)}),Cr(this,Or,()=>{var e,t;(t=(e=this.tooltipEl)?.updateXOffset)==null||t.call(e)}),Cr(this,kr,e=>{let{key:t}=e;this.keysUsed.includes(t)?this.preventClick||this.handleClick(e):this.removeEventListener(`keyup`,H(this,kr))}),Cr(this,Ar,e=>{let{metaKey:t,altKey:n,key:r}=e;t||n||!this.keysUsed.includes(r)?this.removeEventListener(`keyup`,H(this,kr)):this.addEventListener(`keyup`,H(this,kr),{once:!0})}),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);let e=Ne(this.attributes),t=this.constructor.getTemplateHTML(e);this.shadowRoot.setHTMLUnsafe?this.shadowRoot.setHTMLUnsafe(t):this.shadowRoot.innerHTML=t}this.tooltipEl=this.shadowRoot.querySelector(`media-tooltip`)}static get observedAttributes(){return[`disabled`,Nr.TOOLTIP_PLACEMENT,h.MEDIA_CONTROLLER,v.MEDIA_LANG]}enable(){this.addEventListener(`click`,H(this,Dr)),this.addEventListener(`keydown`,H(this,Ar)),this.tabIndex=0}disable(){this.removeEventListener(`click`,H(this,Dr)),this.removeEventListener(`keydown`,H(this,Ar)),this.removeEventListener(`keyup`,H(this,kr)),this.tabIndex=-1}attributeChangedCallback(e,t,n){var r,i,a,o;e===h.MEDIA_CONTROLLER?(t&&((i=(r=H(this,Er))?.unassociateElement)==null||i.call(r,this),wr(this,Er,null)),n&&this.isConnected&&(wr(this,Er,this.getRootNode()?.getElementById(n)),(o=(a=H(this,Er))?.associateElement)==null||o.call(a,this))):e===`disabled`&&n!==t?n==null?this.enable():this.disable():e===Nr.TOOLTIP_PLACEMENT&&this.tooltipEl&&n!==t?this.tooltipEl.placement=n:e===v.MEDIA_LANG&&(this.shadowRoot.querySelector(`slot[name="tooltip-content"]`).innerHTML=this.constructor.getTooltipContentHTML()),H(this,Or).call(this)}connectedCallback(){var e,t;let{style:n}=E(this.shadowRoot,`:host`);n.setProperty(`display`,`var(--media-control-display, var(--${this.localName}-display, inline-flex))`),this.hasAttribute(`disabled`)?this.disable():this.enable(),this.setAttribute(`role`,`button`);let r=this.getAttribute(h.MEDIA_CONTROLLER);r&&(wr(this,Er,this.getRootNode()?.getElementById(r)),(t=(e=H(this,Er))?.associateElement)==null||t.call(e,this)),w.customElements.whenDefined(`media-tooltip`).then(()=>Tr(this,jr,Mr).call(this))}disconnectedCallback(){var e,t;this.disable(),(t=(e=H(this,Er))?.unassociateElement)==null||t.call(e,this),wr(this,Er,null),this.removeEventListener(`mouseenter`,H(this,Or)),this.removeEventListener(`focus`,H(this,Or)),this.removeEventListener(`click`,H(this,Dr))}get keysUsed(){return[`Enter`,` `]}get tooltipPlacement(){return j(this,Nr.TOOLTIP_PLACEMENT)}set tooltipPlacement(e){M(this,Nr.TOOLTIP_PLACEMENT,e)}get mediaController(){return j(this,h.MEDIA_CONTROLLER)}set mediaController(e){M(this,h.MEDIA_CONTROLLER,e)}get disabled(){return k(this,Nr.DISABLED)}set disabled(e){A(this,Nr.DISABLED,e)}get noTooltip(){return k(this,Nr.NO_TOOLTIP)}set noTooltip(e){A(this,Nr.NO_TOOLTIP,e)}handleClick(e){}};Er=new WeakMap,Dr=new WeakMap,Or=new WeakMap,kr=new WeakMap,Ar=new WeakMap,jr=new WeakSet,Mr=function(){this.addEventListener(`mouseenter`,H(this,Or)),this.addEventListener(`focus`,H(this,Or)),this.addEventListener(`click`,H(this,Dr));let e=this.tooltipPlacement;e&&this.tooltipEl&&(this.tooltipEl.placement=e)},U.shadowRootOptions={mode:`open`},U.getTemplateHTML=Pr,U.getSlotTemplateHTML=Fr,U.getTooltipContentHTML=Ir,w.customElements.get(`media-chrome-button`)||w.customElements.define(`media-chrome-button`,U);var Lr=U,Rr=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M22.13 3H3.87a.87.87 0 0 0-.87.87v13.26a.87.87 0 0 0 .87.87h3.4L9 16H5V5h16v11h-4l1.72 2h3.4a.87.87 0 0 0 .87-.87V3.87a.87.87 0 0 0-.86-.87Zm-8.75 11.44a.5.5 0 0 0-.76 0l-4.91 5.73a.5.5 0 0 0 .38.83h9.82a.501.501 0 0 0 .38-.83l-4.91-5.73Z"/>
</svg>
`;function zr(e){return`
    <style>
      :host([${v.MEDIA_IS_AIRPLAYING}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      
      :host(:not([${v.MEDIA_IS_AIRPLAYING}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${v.MEDIA_IS_AIRPLAYING}]) slot[name=tooltip-enter],
      :host(:not([${v.MEDIA_IS_AIRPLAYING}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${Rr}</slot>
      <slot name="exit">${Rr}</slot>
    </slot>
  `}function Br(){return`
    <slot name="tooltip-enter">${C(`start airplay`)}</slot>
    <slot name="tooltip-exit">${C(`stop airplay`)}</slot>
  `}var Vr=e=>{let t=e.mediaIsAirplaying?C(`stop airplay`):C(`start airplay`);e.setAttribute(`aria-label`,t)},Hr=class extends U{static get observedAttributes(){return[...super.observedAttributes,v.MEDIA_IS_AIRPLAYING,v.MEDIA_AIRPLAY_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),Vr(this)}attributeChangedCallback(e,t,n){super.attributeChangedCallback(e,t,n),e===v.MEDIA_IS_AIRPLAYING&&Vr(this)}get mediaIsAirplaying(){return k(this,v.MEDIA_IS_AIRPLAYING)}set mediaIsAirplaying(e){A(this,v.MEDIA_IS_AIRPLAYING,e)}get mediaAirplayUnavailable(){return j(this,v.MEDIA_AIRPLAY_UNAVAILABLE)}set mediaAirplayUnavailable(e){M(this,v.MEDIA_AIRPLAY_UNAVAILABLE,e)}handleClick(){let e=new w.CustomEvent(m.MEDIA_AIRPLAY_REQUEST,{composed:!0,bubbles:!0});this.dispatchEvent(e)}};Hr.getSlotTemplateHTML=zr,Hr.getTooltipContentHTML=Br,w.customElements.get(`media-airplay-button`)||w.customElements.define(`media-airplay-button`,Hr);var Ur=Hr,Wr=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M22.83 5.68a2.58 2.58 0 0 0-2.3-2.5c-3.62-.24-11.44-.24-15.06 0a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c3.62.24 11.44.24 15.06 0a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-11.39 9.45a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.92 3.92 0 0 1 .92-2.77 3.18 3.18 0 0 1 2.43-1 2.94 2.94 0 0 1 2.13.78c.364.359.62.813.74 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.17 1.61 1.61 0 0 0-1.29.58 2.79 2.79 0 0 0-.5 1.89 3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.48 1.48 0 0 0 1-.37 2.1 2.1 0 0 0 .59-1.14l1.4.44a3.23 3.23 0 0 1-1.07 1.69Zm7.22 0a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.88 3.88 0 0 1 .93-2.77 3.14 3.14 0 0 1 2.42-1 3 3 0 0 1 2.16.82 2.8 2.8 0 0 1 .73 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.21 1.61 1.61 0 0 0-1.29.58A2.79 2.79 0 0 0 15 12a3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.44 1.44 0 0 0 1-.37 2.1 2.1 0 0 0 .6-1.15l1.4.44a3.17 3.17 0 0 1-1.1 1.7Z"/>
</svg>`,Gr=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M17.73 14.09a1.4 1.4 0 0 1-1 .37 1.579 1.579 0 0 1-1.27-.58A3 3 0 0 1 15 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34A2.89 2.89 0 0 0 19 9.07a3 3 0 0 0-2.14-.78 3.14 3.14 0 0 0-2.42 1 3.91 3.91 0 0 0-.93 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.17 3.17 0 0 0 1.07-1.74l-1.4-.45c-.083.43-.3.822-.62 1.12Zm-7.22 0a1.43 1.43 0 0 1-1 .37 1.58 1.58 0 0 1-1.27-.58A3 3 0 0 1 7.76 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34a2.81 2.81 0 0 0-.74-1.32 2.94 2.94 0 0 0-2.13-.78 3.18 3.18 0 0 0-2.43 1 4 4 0 0 0-.92 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.23 3.23 0 0 0 1.07-1.74l-1.4-.45a2.06 2.06 0 0 1-.6 1.07Zm12.32-8.41a2.59 2.59 0 0 0-2.3-2.51C18.72 3.05 15.86 3 13 3c-2.86 0-5.72.05-7.53.17a2.59 2.59 0 0 0-2.3 2.51c-.23 4.207-.23 8.423 0 12.63a2.57 2.57 0 0 0 2.3 2.5c1.81.13 4.67.19 7.53.19 2.86 0 5.72-.06 7.53-.19a2.57 2.57 0 0 0 2.3-2.5c.23-4.207.23-8.423 0-12.63Zm-1.49 12.53a1.11 1.11 0 0 1-.91 1.11c-1.67.11-4.45.18-7.43.18-2.98 0-5.76-.07-7.43-.18a1.11 1.11 0 0 1-.91-1.11c-.21-4.14-.21-8.29 0-12.43a1.11 1.11 0 0 1 .91-1.11C7.24 4.56 10 4.49 13 4.49s5.76.07 7.43.18a1.11 1.11 0 0 1 .91 1.11c.21 4.14.21 8.29 0 12.43Z"/>
</svg>`;function Kr(e){return`
    <style>
      :host([aria-checked="true"]) slot[name=off] {
        display: none !important;
      }

      
      :host(:not([aria-checked="true"])) slot[name=on] {
        display: none !important;
      }

      :host([aria-checked="true"]) slot[name=tooltip-enable],
      :host(:not([aria-checked="true"])) slot[name=tooltip-disable] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="on">${Wr}</slot>
      <slot name="off">${Gr}</slot>
    </slot>
  `}function qr(){return`
    <slot name="tooltip-enable">${C(`Enable captions`)}</slot>
    <slot name="tooltip-disable">${C(`Disable captions`)}</slot>
  `}var Jr=e=>{e.setAttribute(`aria-checked`,$t(e).toString())},Yr=class extends U{static get observedAttributes(){return[...super.observedAttributes,v.MEDIA_SUBTITLES_LIST,v.MEDIA_SUBTITLES_SHOWING]}connectedCallback(){super.connectedCallback(),this.setAttribute(`role`,`button`),this.setAttribute(`aria-label`,C(`closed captions`)),Jr(this)}attributeChangedCallback(e,t,n){super.attributeChangedCallback(e,t,n),e===v.MEDIA_SUBTITLES_SHOWING&&Jr(this)}get mediaSubtitlesList(){return Xr(this,v.MEDIA_SUBTITLES_LIST)}set mediaSubtitlesList(e){Zr(this,v.MEDIA_SUBTITLES_LIST,e)}get mediaSubtitlesShowing(){return Xr(this,v.MEDIA_SUBTITLES_SHOWING)}set mediaSubtitlesShowing(e){Zr(this,v.MEDIA_SUBTITLES_SHOWING,e)}handleClick(){this.dispatchEvent(new w.CustomEvent(m.MEDIA_TOGGLE_SUBTITLES_REQUEST,{composed:!0,bubbles:!0}))}};Yr.getSlotTemplateHTML=Kr,Yr.getTooltipContentHTML=qr;var Xr=(e,t)=>{let n=e.getAttribute(t);return n?Gt(n):[]},Zr=(e,t,n)=>{if(!n?.length){e.removeAttribute(t);return}let r=Jt(n);e.getAttribute(t)!==r&&e.setAttribute(t,r)};w.customElements.get(`media-captions-button`)||w.customElements.define(`media-captions-button`,Yr);var Qr=Yr,$r=`<svg aria-hidden="true" viewBox="0 0 24 24"><g><path class="cast_caf_icon_arch0" d="M1,18 L1,21 L4,21 C4,19.3 2.66,18 1,18 L1,18 Z"/><path class="cast_caf_icon_arch1" d="M1,14 L1,16 C3.76,16 6,18.2 6,21 L8,21 C8,17.13 4.87,14 1,14 L1,14 Z"/><path class="cast_caf_icon_arch2" d="M1,10 L1,12 C5.97,12 10,16.0 10,21 L12,21 C12,14.92 7.07,10 1,10 L1,10 Z"/><path class="cast_caf_icon_box" d="M21,3 L3,3 C1.9,3 1,3.9 1,5 L1,8 L3,8 L3,5 L21,5 L21,19 L14,19 L14,21 L21,21 C22.1,21 23,20.1 23,19 L23,5 C23,3.9 22.1,3 21,3 L21,3 Z"/></g></svg>`,ei=`<svg aria-hidden="true" viewBox="0 0 24 24"><g><path class="cast_caf_icon_arch0" d="M1,18 L1,21 L4,21 C4,19.3 2.66,18 1,18 L1,18 Z"/><path class="cast_caf_icon_arch1" d="M1,14 L1,16 C3.76,16 6,18.2 6,21 L8,21 C8,17.13 4.87,14 1,14 L1,14 Z"/><path class="cast_caf_icon_arch2" d="M1,10 L1,12 C5.97,12 10,16.0 10,21 L12,21 C12,14.92 7.07,10 1,10 L1,10 Z"/><path class="cast_caf_icon_box" d="M21,3 L3,3 C1.9,3 1,3.9 1,5 L1,8 L3,8 L3,5 L21,5 L21,19 L14,19 L14,21 L21,21 C22.1,21 23,20.1 23,19 L23,5 C23,3.9 22.1,3 21,3 L21,3 Z"/><path class="cast_caf_icon_boxfill" d="M5,7 L5,8.63 C8,8.6 13.37,14 13.37,17 L19,17 L19,7 Z"/></g></svg>`;function ti(e){return`
    <style>
      :host([${v.MEDIA_IS_CASTING}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      
      :host(:not([${v.MEDIA_IS_CASTING}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${v.MEDIA_IS_CASTING}]) slot[name=tooltip-enter],
      :host(:not([${v.MEDIA_IS_CASTING}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${$r}</slot>
      <slot name="exit">${ei}</slot>
    </slot>
  `}function ni(){return`
    <slot name="tooltip-enter">${C(`Start casting`)}</slot>
    <slot name="tooltip-exit">${C(`Stop casting`)}</slot>
  `}var ri=e=>{let t=e.mediaIsCasting?C(`stop casting`):C(`start casting`);e.setAttribute(`aria-label`,t)},ii=class extends U{static get observedAttributes(){return[...super.observedAttributes,v.MEDIA_IS_CASTING,v.MEDIA_CAST_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),ri(this)}attributeChangedCallback(e,t,n){super.attributeChangedCallback(e,t,n),e===v.MEDIA_IS_CASTING&&ri(this)}get mediaIsCasting(){return k(this,v.MEDIA_IS_CASTING)}set mediaIsCasting(e){A(this,v.MEDIA_IS_CASTING,e)}get mediaCastUnavailable(){return j(this,v.MEDIA_CAST_UNAVAILABLE)}set mediaCastUnavailable(e){M(this,v.MEDIA_CAST_UNAVAILABLE,e)}handleClick(){let e=this.mediaIsCasting?m.MEDIA_EXIT_CAST_REQUEST:m.MEDIA_ENTER_CAST_REQUEST;this.dispatchEvent(new w.CustomEvent(e,{composed:!0,bubbles:!0}))}};ii.getSlotTemplateHTML=ti,ii.getTooltipContentHTML=ni,w.customElements.get(`media-cast-button`)||w.customElements.define(`media-cast-button`,ii);var ai=ii,oi=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},si=(e,t,n)=>(oi(e,t,`read from private field`),n?n.call(e):t.get(e)),ci=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},li=(e,t,n,r)=>(oi(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),ui=(e,t,n)=>(oi(e,t,`access private method`),n),di,fi,pi,mi,hi,gi,_i,vi,yi,bi,xi,Si,Ci,wi,Ti;function Ei(e){return`
    <style>
      :host {
        font: var(--media-font,
          var(--media-font-weight, normal)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        display: var(--media-dialog-display, inline-flex);
        justify-content: center;
        align-items: center;
        
        transition-behavior: allow-discrete;
        visibility: hidden;
        opacity: 0;
        transform: translateY(2px) scale(.99);
        pointer-events: none;
      }

      :host([open]) {
        transition: display .2s, visibility 0s, opacity .2s ease-out, transform .15s ease-out;
        visibility: visible;
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      #content {
        display: flex;
        position: relative;
        box-sizing: border-box;
        width: min(320px, 100%);
        word-wrap: break-word;
        max-height: 100%;
        overflow: auto;
        text-align: center;
        line-height: 1.4;
      }
    </style>
    ${this.getSlotTemplateHTML(e)}
  `}function Di(e){return`
    <slot id="content"></slot>
  `}var Oi={OPEN:`open`,ANCHOR:`anchor`},ki=class extends w.HTMLElement{constructor(){super(),ci(this,mi),ci(this,gi),ci(this,vi),ci(this,bi),ci(this,Si),ci(this,wi),ci(this,di,!1),ci(this,fi,null),ci(this,pi,null)}static get observedAttributes(){return[Oi.OPEN,Oi.ANCHOR]}get open(){return k(this,Oi.OPEN)}set open(e){A(this,Oi.OPEN,e)}handleEvent(e){switch(e.type){case`invoke`:ui(this,bi,xi).call(this,e);break;case`focusout`:ui(this,Si,Ci).call(this,e);break;case`keydown`:ui(this,wi,Ti).call(this,e)}}connectedCallback(){ui(this,mi,hi).call(this),this.role||=`dialog`,this.addEventListener(`invoke`,this),this.addEventListener(`focusout`,this),this.addEventListener(`keydown`,this)}disconnectedCallback(){this.removeEventListener(`invoke`,this),this.removeEventListener(`focusout`,this),this.removeEventListener(`keydown`,this)}attributeChangedCallback(e,t,n){ui(this,mi,hi).call(this),e===Oi.OPEN&&n!==t&&(this.open?ui(this,gi,_i).call(this):ui(this,vi,yi).call(this))}focus(){li(this,fi,Ve());let e=!this.dispatchEvent(new Event(`focus`,{composed:!0,cancelable:!0})),t=!this.dispatchEvent(new Event(`focusin`,{composed:!0,bubbles:!0,cancelable:!0}));e||t||this.querySelector(`[autofocus], [tabindex]:not([tabindex="-1"]), [role="menu"]`)?.focus()}get keysUsed(){return[`Escape`,`Tab`]}};di=new WeakMap,fi=new WeakMap,pi=new WeakMap,mi=new WeakSet,hi=function(){if(!si(this,di)&&(li(this,di,!0),!this.shadowRoot)){this.attachShadow(this.constructor.shadowRootOptions);let e=Ne(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e),queueMicrotask(()=>{let{style:e}=E(this.shadowRoot,`:host`);e.setProperty(`transition`,`display .15s, visibility .15s, opacity .15s ease-in, transform .15s ease-in`)})}},gi=new WeakSet,_i=function(){var e;(e=si(this,pi))==null||e.setAttribute(`aria-expanded`,`true`),this.dispatchEvent(new Event(`open`,{composed:!0,bubbles:!0})),this.addEventListener(`transitionend`,()=>this.focus(),{once:!0})},vi=new WeakSet,yi=function(){var e;(e=si(this,pi))==null||e.setAttribute(`aria-expanded`,`false`),this.dispatchEvent(new Event(`close`,{composed:!0,bubbles:!0}))},bi=new WeakSet,xi=function(e){li(this,pi,e.relatedTarget),ze(this,e.relatedTarget)||(this.open=!this.open)},Si=new WeakSet,Ci=function(e){var t;ze(this,e.relatedTarget)||((t=si(this,fi))==null||t.focus(),si(this,pi)&&si(this,pi)!==e.relatedTarget&&this.open&&(this.open=!1))},wi=new WeakSet,Ti=function(e){var t,n,r,i,a;let{key:o,ctrlKey:s,altKey:c,metaKey:l}=e;s||c||l||this.keysUsed.includes(o)&&(e.preventDefault(),e.stopPropagation(),o===`Tab`?(e.shiftKey?(n=(t=this.previousElementSibling)?.focus)==null||n.call(t):(i=(r=this.nextElementSibling)?.focus)==null||i.call(r),this.blur()):o===`Escape`&&((a=si(this,fi))==null||a.focus(),this.open=!1))},ki.shadowRootOptions={mode:`open`},ki.getTemplateHTML=Ei,ki.getSlotTemplateHTML=Di,w.customElements.get(`media-chrome-dialog`)||w.customElements.define(`media-chrome-dialog`,ki);var Ai=ki,ji=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},W=(e,t,n)=>(ji(e,t,`read from private field`),n?n.call(e):t.get(e)),G=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},Mi=(e,t,n,r)=>(ji(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),Ni=(e,t,n)=>(ji(e,t,`access private method`),n),Pi,Fi,Ii,Li,Ri,zi,Bi,Vi,Hi,Ui,Wi,Gi,Ki,qi,Ji,Yi,Xi,Zi,Qi,$i,ea,ta,na,ra,ia;function aa(e){return`
    <style>
      :host {
        --_focus-box-shadow: var(--media-focus-box-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
        --_media-range-padding: var(--media-range-padding, var(--media-control-padding, 10px));

        box-shadow: var(--_focus-visible-box-shadow, none);
        background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        height: calc(var(--media-control-height, 24px) + 2 * var(--_media-range-padding));
        display: inline-flex;
        align-items: center;
        
        vertical-align: middle;
        box-sizing: border-box;
        position: relative;
        width: 100px;
        transition: background .15s linear;
        cursor: var(--media-cursor, pointer);
        pointer-events: auto;
        touch-action: none; 
      }

      
      input[type=range]:focus {
        outline: 0;
      }
      input[type=range]:focus::-webkit-slider-runnable-track {
        outline: 0;
      }

      :host(:hover) {
        background: var(--media-control-hover-background, rgb(50 50 70 / .7));
      }

      #leftgap {
        padding-left: var(--media-range-padding-left, var(--_media-range-padding));
      }

      #rightgap {
        padding-right: var(--media-range-padding-right, var(--_media-range-padding));
      }

      #startpoint,
      #endpoint {
        position: absolute;
      }

      #endpoint {
        right: 0;
      }

      #container {
        
        width: var(--media-range-track-width, 100%);
        transform: translate(var(--media-range-track-translate-x, 0px), var(--media-range-track-translate-y, 0px));
        position: relative;
        height: 100%;
        display: flex;
        align-items: center;
        min-width: 40px;
      }

      #range {
        
        display: var(--media-time-range-hover-display, block);
        bottom: var(--media-time-range-hover-bottom, 0);
        height: var(--media-time-range-hover-height, max(100% , 25px));
        width: 100%;
        position: absolute;
        cursor: var(--media-cursor, pointer);

        -webkit-appearance: none; 
        -webkit-tap-highlight-color: transparent;
        background: transparent; 
        margin: 0;
        z-index: 1;
      }

      @media (hover: hover) {
        #range {
          bottom: var(--media-time-range-hover-bottom, 0);
          height: var(--media-time-range-hover-height, max(100%, 20px));
        }
      }

      
      
      #range::-webkit-slider-thumb {
        -webkit-appearance: none;
        background: transparent;
        width: .1px;
        height: .1px;
      }

      
      #range::-moz-range-thumb {
        background: transparent;
        border: transparent;
        width: .1px;
        height: .1px;
      }

      #appearance {
        height: var(--media-range-track-height, 4px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100%;
        position: absolute;
        
        will-change: transform;
      }

      #track {
        background: var(--media-range-track-background, rgb(255 255 255 / .2));
        border-radius: var(--media-range-track-border-radius, 1px);
        border: var(--media-range-track-border, none);
        outline: var(--media-range-track-outline);
        outline-offset: var(--media-range-track-outline-offset);
        backdrop-filter: var(--media-range-track-backdrop-filter);
        -webkit-backdrop-filter: var(--media-range-track-backdrop-filter);
        box-shadow: var(--media-range-track-box-shadow, none);
        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      #progress,
      #pointer {
        position: absolute;
        height: 100%;
        will-change: width;
      }

      #progress {
        background: var(--media-range-bar-color, var(--media-primary-color, rgb(238 238 238)));
        transition: var(--media-range-track-transition);
      }

      #pointer {
        background: var(--media-range-track-pointer-background);
        border-right: var(--media-range-track-pointer-border-right);
        transition: visibility .25s, opacity .25s;
        visibility: hidden;
        opacity: 0;
      }

      @media (hover: hover) {
        :host(:hover) #pointer {
          transition: visibility .5s, opacity .5s;
          visibility: visible;
          opacity: 1;
        }
      }

      #thumb,
      ::slotted([slot=thumb]) {
        width: var(--media-range-thumb-width, 10px);
        height: var(--media-range-thumb-height, 10px);
        transition: var(--media-range-thumb-transition);
        transform: var(--media-range-thumb-transform, none);
        opacity: var(--media-range-thumb-opacity, 1);
        translate: -50%;
        position: absolute;
        left: 0;
        cursor: var(--media-cursor, pointer);
      }

      #thumb {
        border-radius: var(--media-range-thumb-border-radius, 10px);
        background: var(--media-range-thumb-background, var(--media-primary-color, rgb(238 238 238)));
        box-shadow: var(--media-range-thumb-box-shadow, 1px 1px 1px transparent);
        border: var(--media-range-thumb-border, none);
      }

      :host([disabled]) #thumb {
        background-color: #777;
      }

      .segments #appearance {
        height: var(--media-range-segment-hover-height, 7px);
      }

      #track {
        clip-path: url(#segments-clipping);
      }

      #segments {
        --segments-gap: var(--media-range-segments-gap, 2px);
        position: absolute;
        width: 100%;
        height: 100%;
      }

      #segments-clipping {
        transform: translateX(calc(var(--segments-gap) / 2));
      }

      #segments-clipping:empty {
        display: none;
      }

      #segments-clipping rect {
        height: var(--media-range-track-height, 4px);
        y: calc((var(--media-range-segment-hover-height, 7px) - var(--media-range-track-height, 4px)) / 2);
        transition: var(--media-range-segment-transition, transform .1s ease-in-out);
        transform: var(--media-range-segment-transform, scaleY(1));
        transform-origin: center;
      }

      /* Visible label for accessibility - positioned off-screen but technically visible (Firefox requires visible labels) */
      #range-label {
        position: absolute;
        left: -10000px;
        background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        pointer-events: none;
      }
    </style>
    <div id="leftgap"></div>
    <div id="container">
      <div id="startpoint"></div>
      <div id="endpoint"></div>
      <div id="appearance">
        <div id="track" part="track">
          <div id="pointer"></div>
          <div id="progress" part="progress"></div>
        </div>
        <slot name="thumb">
          <div id="thumb" part="thumb"></div>
        </slot>
        <svg id="segments" aria-hidden="true"><clipPath id="segments-clipping"></clipPath></svg>
      </div>
        <input id="range" type="range" min="0" max="1" step="any" value="0">
        <label for="range" id="range-label"></label>

      ${this.getContainerTemplateHTML(e)}
    </div>
    <div id="rightgap"></div>
  `}function oa(e){return``}var sa=class extends w.HTMLElement{constructor(){if(super(),G(this,Ui),G(this,Gi),G(this,qi),G(this,Yi),G(this,Zi),G(this,$i),G(this,ta),G(this,ra),G(this,Pi,void 0),G(this,Fi,void 0),G(this,Ii,void 0),G(this,Li,void 0),G(this,Ri,{}),G(this,zi,[]),G(this,Bi,()=>{if(this.range.matches(`:focus-visible`)){let{style:e}=E(this.shadowRoot,`:host`);e.setProperty(`--_focus-visible-box-shadow`,`var(--_focus-box-shadow)`)}}),G(this,Vi,()=>{let{style:e}=E(this.shadowRoot,`:host`);e.removeProperty(`--_focus-visible-box-shadow`)}),G(this,Hi,()=>{let e=this.shadowRoot.querySelector(`#segments-clipping`);e&&e.parentNode.append(e)}),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);let e=Ne(this.attributes),t=this.constructor.getTemplateHTML(e);this.shadowRoot.setHTMLUnsafe?this.shadowRoot.setHTMLUnsafe(t):this.shadowRoot.innerHTML=t}this.container=this.shadowRoot.querySelector(`#container`),Mi(this,Ii,this.shadowRoot.querySelector(`#startpoint`)),Mi(this,Li,this.shadowRoot.querySelector(`#endpoint`)),this.range=this.shadowRoot.querySelector(`#range`),this.appearance=this.shadowRoot.querySelector(`#appearance`)}static get observedAttributes(){return[`disabled`,`aria-disabled`,h.MEDIA_CONTROLLER]}attributeChangedCallback(e,t,n){var r,i,a,o;e===h.MEDIA_CONTROLLER?(t&&((i=(r=W(this,Pi))?.unassociateElement)==null||i.call(r,this),Mi(this,Pi,null)),n&&this.isConnected&&(Mi(this,Pi,this.getRootNode()?.getElementById(n)),(o=(a=W(this,Pi))?.associateElement)==null||o.call(a,this))):(e===`disabled`||e===`aria-disabled`&&t!==n)&&(n==null?(this.range.removeAttribute(e),Ni(this,Gi,Ki).call(this)):(this.range.setAttribute(e,n),Ni(this,qi,Ji).call(this)))}connectedCallback(){var e,t;let{style:n}=E(this.shadowRoot,`:host`);n.setProperty(`display`,`var(--media-control-display, var(--${this.localName}-display, inline-flex))`),W(this,Ri).pointer=E(this.shadowRoot,`#pointer`),W(this,Ri).progress=E(this.shadowRoot,`#progress`),W(this,Ri).thumb=E(this.shadowRoot,`#thumb, ::slotted([slot="thumb"])`),W(this,Ri).activeSegment=E(this.shadowRoot,`#segments-clipping rect:nth-child(0)`);let r=this.getAttribute(h.MEDIA_CONTROLLER);r&&(Mi(this,Pi,this.getRootNode()?.getElementById(r)),(t=(e=W(this,Pi))?.associateElement)==null||t.call(e,this)),this.updateBar(),this.shadowRoot.addEventListener(`focusin`,W(this,Bi)),this.shadowRoot.addEventListener(`focusout`,W(this,Vi)),Ni(this,Gi,Ki).call(this),je(this.container,W(this,Hi))}disconnectedCallback(){var e,t;Ni(this,qi,Ji).call(this),(t=(e=W(this,Pi))?.unassociateElement)==null||t.call(e,this),Mi(this,Pi,null),this.shadowRoot.removeEventListener(`focusin`,W(this,Bi)),this.shadowRoot.removeEventListener(`focusout`,W(this,Vi)),Me(this.container,W(this,Hi))}updatePointerBar(e){var t;(t=W(this,Ri).pointer)==null||t.style.setProperty(`width`,`${this.getPointerRatio(e)*100}%`)}updateBar(){var e,t;let n=this.range.valueAsNumber*100;(e=W(this,Ri).progress)==null||e.style.setProperty(`width`,`${n}%`),(t=W(this,Ri).thumb)==null||t.style.setProperty(`left`,`${n}%`)}updateSegments(e){let t=this.shadowRoot.querySelector(`#segments-clipping`);if(t.textContent=``,this.container.classList.toggle(`segments`,!!e?.length),!e?.length)return;let n=[...new Set([+this.range.min,...e.flatMap(e=>[e.start,e.end]),+this.range.max])];Mi(this,zi,[...n]);let r=n.pop();for(let[e,i]of n.entries()){let[a,o]=[e===0,e===n.length-1],s=a?`calc(var(--segments-gap) / -1)`:`${i*100}%`,c=`calc(${((o?r:n[e+1])-i)*100}%${a||o?``:` - var(--segments-gap)`})`,l=T.createElementNS(`http://www.w3.org/2000/svg`,`rect`),u=Ke(this.shadowRoot,`#segments-clipping rect:nth-child(${e+1})`);u.style.setProperty(`x`,s),u.style.setProperty(`width`,c),t.append(l)}}getPointerRatio(e){return We(e.clientX,e.clientY,W(this,Ii).getBoundingClientRect(),W(this,Li).getBoundingClientRect())}get dragging(){return this.hasAttribute(`dragging`)}handleEvent(e){switch(e.type){case`pointermove`:Ni(this,ra,ia).call(this,e);break;case`input`:this.updateBar();break;case`pointerenter`:Ni(this,Zi,Qi).call(this,e);break;case`pointerdown`:Ni(this,Yi,Xi).call(this,e);break;case`pointerup`:Ni(this,$i,ea).call(this);break;case`pointerleave`:Ni(this,ta,na).call(this)}}get keysUsed(){return[`ArrowUp`,`ArrowRight`,`ArrowDown`,`ArrowLeft`]}};Pi=new WeakMap,Fi=new WeakMap,Ii=new WeakMap,Li=new WeakMap,Ri=new WeakMap,zi=new WeakMap,Bi=new WeakMap,Vi=new WeakMap,Hi=new WeakMap,Ui=new WeakSet,Wi=function(e){let t=W(this,Ri).activeSegment;if(!t)return;let n=this.getPointerRatio(e),r=`#segments-clipping rect:nth-child(${W(this,zi).findIndex((e,t,r)=>{let i=r[t+1];return i!=null&&n>=e&&n<=i})+1})`;(t.selectorText!=r||!t.style.transform)&&(t.selectorText=r,t.style.setProperty(`transform`,`var(--media-range-segment-hover-transform, scaleY(2))`))},Gi=new WeakSet,Ki=function(){!this.hasAttribute(`disabled`)&&this.isConnected&&(this.addEventListener(`input`,this),this.addEventListener(`pointerdown`,this),this.addEventListener(`pointerenter`,this))},qi=new WeakSet,Ji=function(){var e,t;this.removeEventListener(`input`,this),this.removeEventListener(`pointerdown`,this),this.removeEventListener(`pointerenter`,this),this.removeEventListener(`pointerleave`,this),(e=w.window)==null||e.removeEventListener(`pointerup`,this),(t=w.window)==null||t.removeEventListener(`pointermove`,this)},Yi=new WeakSet,Xi=function(e){var t;Mi(this,Fi,e.composedPath().includes(this.range)),(t=w.window)==null||t.addEventListener(`pointerup`,this,{once:!0})},Zi=new WeakSet,Qi=function(e){var t;e.pointerType!==`mouse`&&Ni(this,Yi,Xi).call(this,e),this.addEventListener(`pointerleave`,this,{once:!0}),(t=w.window)==null||t.addEventListener(`pointermove`,this)},$i=new WeakSet,ea=function(){var e;(e=w.window)==null||e.removeEventListener(`pointerup`,this),this.toggleAttribute(`dragging`,!1),this.range.disabled=this.hasAttribute(`disabled`)},ta=new WeakSet,na=function(){var e,t;this.removeEventListener(`pointerleave`,this),(e=w.window)==null||e.removeEventListener(`pointermove`,this),this.toggleAttribute(`dragging`,!1),this.range.disabled=this.hasAttribute(`disabled`),(t=W(this,Ri).activeSegment)==null||t.style.removeProperty(`transform`)},ra=new WeakSet,ia=function(e){(e.pointerType!==`pen`||e.buttons!==0)&&(this.toggleAttribute(`dragging`,e.buttons===1||e.pointerType!==`mouse`),this.updatePointerBar(e),Ni(this,Ui,Wi).call(this,e),this.dragging&&(e.pointerType!==`mouse`||!W(this,Fi))&&(this.range.disabled=!0,this.range.valueAsNumber=this.getPointerRatio(e),this.range.dispatchEvent(new Event(`input`,{bubbles:!0,composed:!0}))))},sa.shadowRootOptions={mode:`open`},sa.getTemplateHTML=aa,sa.getContainerTemplateHTML=oa,w.customElements.get(`media-chrome-range`)||w.customElements.define(`media-chrome-range`,sa);var ca=sa,la=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},ua=(e,t,n)=>(la(e,t,`read from private field`),n?n.call(e):t.get(e)),da=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},fa=(e,t,n,r)=>(la(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),pa;function ma(e){return`
    <style>
      :host {
        
        box-sizing: border-box;
        display: var(--media-control-display, var(--media-control-bar-display, inline-flex));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        --media-loading-indicator-icon-height: 44px;
      }

      ::slotted(media-time-range),
      ::slotted(media-volume-range) {
        min-height: 100%;
      }

      ::slotted(media-time-range),
      ::slotted(media-clip-selector) {
        flex-grow: 1;
      }

      ::slotted([role="menu"]) {
        position: absolute;
      }
    </style>

    <slot></slot>
  `}var ha=class extends w.HTMLElement{constructor(){if(super(),da(this,pa,void 0),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);let e=Ne(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}}static get observedAttributes(){return[h.MEDIA_CONTROLLER]}attributeChangedCallback(e,t,n){var r,i,a,o;e===h.MEDIA_CONTROLLER&&(t&&((i=(r=ua(this,pa))?.unassociateElement)==null||i.call(r,this),fa(this,pa,null)),n&&this.isConnected&&(fa(this,pa,this.getRootNode()?.getElementById(n)),(o=(a=ua(this,pa))?.associateElement)==null||o.call(a,this)))}connectedCallback(){var e,t;let n=this.getAttribute(h.MEDIA_CONTROLLER);n&&(fa(this,pa,this.getRootNode()?.getElementById(n)),(t=(e=ua(this,pa))?.associateElement)==null||t.call(e,this))}disconnectedCallback(){var e,t;(t=(e=ua(this,pa))?.unassociateElement)==null||t.call(e,this),fa(this,pa,null)}};pa=new WeakMap,ha.shadowRootOptions={mode:`open`},ha.getTemplateHTML=ma,w.customElements.get(`media-control-bar`)||w.customElements.define(`media-control-bar`,ha);var ga=ha,_a=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},va=(e,t,n)=>(_a(e,t,`read from private field`),n?n.call(e):t.get(e)),ya=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},ba=(e,t,n,r)=>(_a(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),xa;function Sa(e,t={}){return`
    <style>
      :host {
        font: var(--media-font,
          var(--media-font-weight, normal)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        background: var(--media-text-background, var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7))));
        padding: var(--media-control-padding, 10px);
        display: inline-flex;
        justify-content: center;
        align-items: center;
        vertical-align: middle;
        box-sizing: border-box;
        text-align: center;
        pointer-events: auto;
      }

      
      :host(:focus-visible) {
        box-shadow: var(--media-focus-box-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
        outline: 0;
      }

      
      :host(:where(:focus)) {
        box-shadow: none;
        outline: 0;
      }
    </style>

    ${this.getSlotTemplateHTML(e,t)}
  `}function Ca(e,t){return`
    <slot></slot>
  `}var wa=class extends w.HTMLElement{constructor(){if(super(),ya(this,xa,void 0),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);let e=Ne(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}}static get observedAttributes(){return[h.MEDIA_CONTROLLER]}attributeChangedCallback(e,t,n){var r,i,a,o;e===h.MEDIA_CONTROLLER&&(t&&((i=(r=va(this,xa))?.unassociateElement)==null||i.call(r,this),ba(this,xa,null)),n&&this.isConnected&&(ba(this,xa,this.getRootNode()?.getElementById(n)),(o=(a=va(this,xa))?.associateElement)==null||o.call(a,this)))}connectedCallback(){var e,t;let{style:n}=E(this.shadowRoot,`:host`);n.setProperty(`display`,`var(--media-control-display, var(--${this.localName}-display, inline-flex))`);let r=this.getAttribute(h.MEDIA_CONTROLLER);r&&(ba(this,xa,this.getRootNode()?.getElementById(r)),(t=(e=va(this,xa))?.associateElement)==null||t.call(e,this))}disconnectedCallback(){var e,t;(t=(e=va(this,xa))?.unassociateElement)==null||t.call(e,this),ba(this,xa,null)}};xa=new WeakMap,wa.shadowRootOptions={mode:`open`},wa.getTemplateHTML=Sa,wa.getSlotTemplateHTML=Ca,w.customElements.get(`media-text-display`)||w.customElements.define(`media-text-display`,wa);var Ta=wa,Ea=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},Da=(e,t,n)=>(Ea(e,t,`read from private field`),n?n.call(e):t.get(e)),Oa=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},ka=(e,t,n,r)=>(Ea(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),Aa;function ja(e,t){return`
    <slot>${ye(t.mediaDuration)}</slot>
  `}var Ma=class extends wa{constructor(){super(),Oa(this,Aa,void 0),ka(this,Aa,this.shadowRoot.querySelector(`slot`)),Da(this,Aa).textContent=ye(this.mediaDuration??0)}static get observedAttributes(){return[...super.observedAttributes,v.MEDIA_DURATION]}attributeChangedCallback(e,t,n){e===v.MEDIA_DURATION&&(Da(this,Aa).textContent=ye(+n)),super.attributeChangedCallback(e,t,n)}get mediaDuration(){return D(this,v.MEDIA_DURATION)}set mediaDuration(e){O(this,v.MEDIA_DURATION,e)}};Aa=new WeakMap,Ma.getSlotTemplateHTML=ja,w.customElements.get(`media-duration-display`)||w.customElements.define(`media-duration-display`,Ma);var Na=Ma,Pa={2:C(`Network Error`),3:C(`Decode Error`),4:C(`Source Not Supported`),5:C(`Encryption Error`)},Fa={2:C(`A network error caused the media download to fail.`),3:C(`A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.`),4:C(`An unsupported error occurred. The server or network failed, or your browser does not support this format.`),5:C(`The media is encrypted and there are no keys to decrypt it.`)},Ia=e=>e.code===1?null:{title:Pa[e.code]??`Error ${e.code}`,message:Fa[e.code]??e.message},La=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},Ra=(e,t,n)=>(La(e,t,`read from private field`),n?n.call(e):t.get(e)),za=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},Ba=(e,t,n,r)=>(La(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),Va;function Ha(e){return`
    <style>
      :host {
        background: rgb(20 20 30 / .8);
      }

      #content {
        display: block;
        padding: 1.2em 1.5em;
      }

      h3,
      p {
        margin-block: 0 .3em;
      }
    </style>
    <slot name="error-${e.mediaerrorcode}" id="content">
      ${Wa({code:+e.mediaerrorcode,message:e.mediaerrormessage})}
    </slot>
  `}function Ua(e){return e.code&&Ia(e)!==null}function Wa(e){let{title:t,message:n}=Ia(e)??{},r=``;return t&&(r+=`<slot name="error-${e.code}-title"><h3>${t}</h3></slot>`),n&&(r+=`<slot name="error-${e.code}-message"><p>${n}</p></slot>`),r}var Ga=[v.MEDIA_ERROR_CODE,v.MEDIA_ERROR_MESSAGE],Ka=class extends ki{constructor(){super(...arguments),za(this,Va,null)}static get observedAttributes(){return[...super.observedAttributes,...Ga]}formatErrorMessage(e){return this.constructor.formatErrorMessage(e)}attributeChangedCallback(e,t,n){if(super.attributeChangedCallback(e,t,n),!Ga.includes(e))return;let r=this.mediaError??{code:this.mediaErrorCode,message:this.mediaErrorMessage};if(this.open=Ua(r),this.open&&(this.shadowRoot.querySelector(`slot`).name=`error-${this.mediaErrorCode}`,this.shadowRoot.querySelector(`#content`).innerHTML=this.formatErrorMessage(r),!this.hasAttribute(`aria-label`))){let{title:e}=Ia(r);e&&this.setAttribute(`aria-label`,e)}}get mediaError(){return Ra(this,Va)}set mediaError(e){Ba(this,Va,e)}get mediaErrorCode(){return D(this,`mediaerrorcode`)}set mediaErrorCode(e){O(this,`mediaerrorcode`,e)}get mediaErrorMessage(){return j(this,`mediaerrormessage`)}set mediaErrorMessage(e){M(this,`mediaerrormessage`,e)}};Va=new WeakMap,Ka.getSlotTemplateHTML=Ha,Ka.formatErrorMessage=Wa,w.customElements.get(`media-error-dialog`)||w.customElements.define(`media-error-dialog`,Ka);var qa=Ka,Ja=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},Ya=(e,t,n)=>(Ja(e,t,`read from private field`),n?n.call(e):t.get(e)),Xa=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},Za,Qa;function $a(e){return`
    <style>
      :host {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9999;
        background: rgb(20 20 30 / .8);
        backdrop-filter: blur(10px);
      }

      #content {
        display: block;
        width: clamp(400px, 40vw, 700px);
        max-width: 90vw;
        text-align: left;
      }

      h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.5rem;
        font-weight: 500;
        text-align: center;
      }

      .shortcuts-table {
        width: 100%;
        border-collapse: collapse;
      }

      .shortcuts-table tr {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .shortcuts-table tr:last-child {
        border-bottom: none;
      }

      .shortcuts-table td {
        padding: 0.75rem 0.5rem;
      }

      .shortcuts-table td:first-child {
        text-align: right;
        padding-right: 1rem;
        width: 40%;
        min-width: 120px;
      }

      .shortcuts-table td:last-child {
        padding-left: 1rem;
      }

      .key {
        display: inline-block;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        padding: 0.25rem 0.5rem;
        font-family: 'Courier New', monospace;
        font-size: 0.9rem;
        font-weight: 500;
        min-width: 1.5rem;
        text-align: center;
        margin: 0 0.2rem;
      }

      .description {
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.95rem;
      }

      .key-combo {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.3rem;
      }

      .key-separator {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.9rem;
      }
    </style>
    <slot id="content">
      ${eo()}
    </slot>
  `}function eo(){return`
    <h2>Keyboard Shortcuts</h2>
    <table class="shortcuts-table">${[{keys:[`Space`,`k`],description:`Toggle Playback`},{keys:[`m`],description:`Toggle mute`},{keys:[`f`],description:`Toggle fullscreen`},{keys:[`c`],description:`Toggle captions or subtitles, if available`},{keys:[`p`],description:`Toggle Picture in Picture`},{keys:[`←`,`j`],description:`Seek back 10s`},{keys:[`→`,`l`],description:`Seek forward 10s`},{keys:[`↑`],description:`Turn volume up`},{keys:[`↓`],description:`Turn volume down`},{keys:[`< (SHIFT+,)`],description:`Decrease playback rate`},{keys:[`> (SHIFT+.)`],description:`Increase playback rate`}].map(({keys:e,description:t})=>`
      <tr>
        <td>
          <div class="key-combo">${e.map((e,t)=>t>0?`<span class="key-separator">or</span><span class="key">${e}</span>`:`<span class="key">${e}</span>`).join(``)}</div>
        </td>
        <td class="description">${t}</td>
      </tr>
    `).join(``)}</table>
  `}var to=class extends ki{constructor(){super(...arguments),Xa(this,Za,e=>{if(!this.open)return;let t=this.shadowRoot?.querySelector(`#content`);if(!t)return;let n=e.composedPath(),r=n[0]===this||n.includes(this),i=n.includes(t);r&&!i&&(this.open=!1)}),Xa(this,Qa,e=>{if(!this.open)return;let t=e.shiftKey&&(e.key===`/`||e.key===`?`);(e.key===`Escape`||t)&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&(this.open=!1,e.preventDefault(),e.stopPropagation())})}connectedCallback(){super.connectedCallback(),this.open&&(this.addEventListener(`click`,Ya(this,Za)),document.addEventListener(`keydown`,Ya(this,Qa)))}disconnectedCallback(){this.removeEventListener(`click`,Ya(this,Za)),document.removeEventListener(`keydown`,Ya(this,Qa))}attributeChangedCallback(e,t,n){super.attributeChangedCallback(e,t,n),e===`open`&&(this.open?(this.addEventListener(`click`,Ya(this,Za)),document.addEventListener(`keydown`,Ya(this,Qa))):(this.removeEventListener(`click`,Ya(this,Za)),document.removeEventListener(`keydown`,Ya(this,Qa))))}};Za=new WeakMap,Qa=new WeakMap,to.getSlotTemplateHTML=$a,w.customElements.get(`media-keyboard-shortcuts-dialog`)||w.customElements.define(`media-keyboard-shortcuts-dialog`,to);var no=to,ro=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},io=(e,t,n)=>(ro(e,t,`read from private field`),n?n.call(e):t.get(e)),ao=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},oo=(e,t,n,r)=>(ro(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),so,co=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M16 3v2.5h3.5V9H22V3h-6ZM4 9h2.5V5.5H10V3H4v6Zm15.5 9.5H16V21h6v-6h-2.5v3.5ZM6.5 15H4v6h6v-2.5H6.5V15Z"/>
</svg>`,lo=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M18.5 6.5V3H16v6h6V6.5h-3.5ZM16 21h2.5v-3.5H22V15h-6v6ZM4 17.5h3.5V21H10v-6H4v2.5Zm3.5-11H4V9h6V3H7.5v3.5Z"/>
</svg>`;function uo(e){return`
    <style>
      :host([${v.MEDIA_IS_FULLSCREEN}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      
      :host(:not([${v.MEDIA_IS_FULLSCREEN}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${v.MEDIA_IS_FULLSCREEN}]) slot[name=tooltip-enter],
      :host(:not([${v.MEDIA_IS_FULLSCREEN}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${co}</slot>
      <slot name="exit">${lo}</slot>
    </slot>
  `}function fo(){return`
    <slot name="tooltip-enter">${C(`Enter fullscreen mode`)}</slot>
    <slot name="tooltip-exit">${C(`Exit fullscreen mode`)}</slot>
  `}var po=e=>{let t=e.mediaIsFullscreen?C(`exit fullscreen mode`):C(`enter fullscreen mode`);e.setAttribute(`aria-label`,t)},mo=class extends U{constructor(){super(...arguments),ao(this,so,null)}static get observedAttributes(){return[...super.observedAttributes,v.MEDIA_IS_FULLSCREEN,v.MEDIA_FULLSCREEN_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),po(this)}attributeChangedCallback(e,t,n){super.attributeChangedCallback(e,t,n),e===v.MEDIA_IS_FULLSCREEN&&po(this)}get mediaFullscreenUnavailable(){return j(this,v.MEDIA_FULLSCREEN_UNAVAILABLE)}set mediaFullscreenUnavailable(e){M(this,v.MEDIA_FULLSCREEN_UNAVAILABLE,e)}get mediaIsFullscreen(){return k(this,v.MEDIA_IS_FULLSCREEN)}set mediaIsFullscreen(e){A(this,v.MEDIA_IS_FULLSCREEN,e)}handleClick(e){oo(this,so,e);let t=io(this,so)instanceof PointerEvent,n=this.mediaIsFullscreen?new w.CustomEvent(m.MEDIA_EXIT_FULLSCREEN_REQUEST,{composed:!0,bubbles:!0}):new w.CustomEvent(m.MEDIA_ENTER_FULLSCREEN_REQUEST,{composed:!0,bubbles:!0,detail:t});this.dispatchEvent(n)}};so=new WeakMap,mo.getSlotTemplateHTML=uo,mo.getTooltipContentHTML=fo,w.customElements.get(`media-fullscreen-button`)||w.customElements.define(`media-fullscreen-button`,mo);var ho=mo,{MEDIA_TIME_IS_LIVE:go,MEDIA_PAUSED:_o}=v,{MEDIA_SEEK_TO_LIVE_REQUEST:vo,MEDIA_PLAY_REQUEST:yo}=m,bo=`<svg viewBox="0 0 6 12" aria-hidden="true"><circle cx="3" cy="6" r="2"></circle></svg>`;function xo(e){return`
    <style>
      :host { --media-tooltip-display: none; }
      
      slot[name=indicator] > *,
      :host ::slotted([slot=indicator]) {
        
        min-width: auto;
        fill: var(--media-live-button-icon-color, rgb(140, 140, 140));
        color: var(--media-live-button-icon-color, rgb(140, 140, 140));
      }

      :host([${go}]:not([${_o}])) slot[name=indicator] > *,
      :host([${go}]:not([${_o}])) ::slotted([slot=indicator]) {
        fill: var(--media-live-button-indicator-color, rgb(255, 0, 0));
        color: var(--media-live-button-indicator-color, rgb(255, 0, 0));
      }

      :host([${go}]:not([${_o}])) {
        cursor: var(--media-cursor, not-allowed);
      }

      slot[name=text]{
        text-transform: uppercase;
      }

    </style>

    <slot name="indicator">${bo}</slot>
    
    <slot name="spacer">&nbsp;</slot><slot name="text">${C(`live`)}</slot>
  `}var So=e=>{let t=e.mediaPaused||!e.mediaTimeIsLive,n=C(t?`seek to live`:`playing live`);e.setAttribute(`aria-label`,n);let r=e.shadowRoot?.querySelector(`slot[name="text"]`);r&&(r.textContent=C(`live`)),t?e.removeAttribute(`aria-disabled`):e.setAttribute(`aria-disabled`,`true`)},Co=class extends U{static get observedAttributes(){return[...super.observedAttributes,go,_o]}connectedCallback(){super.connectedCallback(),So(this)}attributeChangedCallback(e,t,n){super.attributeChangedCallback(e,t,n),So(this)}get mediaPaused(){return k(this,v.MEDIA_PAUSED)}set mediaPaused(e){A(this,v.MEDIA_PAUSED,e)}get mediaTimeIsLive(){return k(this,v.MEDIA_TIME_IS_LIVE)}set mediaTimeIsLive(e){A(this,v.MEDIA_TIME_IS_LIVE,e)}handleClick(){(this.mediaPaused||!this.mediaTimeIsLive)&&(this.dispatchEvent(new w.CustomEvent(vo,{composed:!0,bubbles:!0})),this.hasAttribute(_o)&&this.dispatchEvent(new w.CustomEvent(yo,{composed:!0,bubbles:!0})))}};Co.getSlotTemplateHTML=xo,w.customElements.get(`media-live-button`)||w.customElements.define(`media-live-button`,Co);var wo=Co,To=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},Eo=(e,t,n)=>(To(e,t,`read from private field`),n?n.call(e):t.get(e)),Do=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},Oo=(e,t,n,r)=>(To(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),ko,Ao,jo={LOADING_DELAY:`loadingdelay`,NO_AUTOHIDE:`noautohide`},Mo=500,No=`
<svg aria-hidden="true" viewBox="0 0 100 100">
  <path d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
    <animateTransform
       attributeName="transform"
       attributeType="XML"
       type="rotate"
       dur="1s"
       from="0 50 50"
       to="360 50 50"
       repeatCount="indefinite" />
  </path>
</svg>
`;function Po(e){return`
    <style>
      :host {
        display: var(--media-control-display, var(--media-loading-indicator-display, inline-block));
        vertical-align: middle;
        box-sizing: border-box;
        --_loading-indicator-delay: var(--media-loading-indicator-transition-delay, ${Mo}ms);
      }

      #status {
        color: rgba(0,0,0,0);
        width: 0px;
        height: 0px;
      }

      :host slot[name=icon] > *,
      :host ::slotted([slot=icon]) {
        opacity: var(--media-loading-indicator-opacity, 0);
        transition: opacity 0.15s;
      }

      :host([${v.MEDIA_LOADING}]:not([${v.MEDIA_PAUSED}])) slot[name=icon] > *,
      :host([${v.MEDIA_LOADING}]:not([${v.MEDIA_PAUSED}])) ::slotted([slot=icon]) {
        opacity: var(--media-loading-indicator-opacity, 1);
        transition: opacity 0.15s var(--_loading-indicator-delay);
      }

      :host #status {
        visibility: var(--media-loading-indicator-opacity, hidden);
        transition: visibility 0.15s;
      }

      :host([${v.MEDIA_LOADING}]:not([${v.MEDIA_PAUSED}])) #status {
        visibility: var(--media-loading-indicator-opacity, visible);
        transition: visibility 0.15s var(--_loading-indicator-delay);
      }

      svg, img, ::slotted(svg), ::slotted(img) {
        width: var(--media-loading-indicator-icon-width);
        height: var(--media-loading-indicator-icon-height, 100px);
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        vertical-align: middle;
      }
    </style>

    <slot name="icon">${No}</slot>
    <div id="status" role="status" aria-live="polite">${C(`media loading`)}</div>
  `}var Fo=class extends w.HTMLElement{constructor(){if(super(),Do(this,ko,void 0),Do(this,Ao,Mo),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);let e=Ne(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}}static get observedAttributes(){return[h.MEDIA_CONTROLLER,v.MEDIA_PAUSED,v.MEDIA_LOADING,jo.LOADING_DELAY]}attributeChangedCallback(e,t,n){var r,i,a,o;e===jo.LOADING_DELAY&&t!==n?this.loadingDelay=Number(n):e===h.MEDIA_CONTROLLER&&(t&&((i=(r=Eo(this,ko))?.unassociateElement)==null||i.call(r,this),Oo(this,ko,null)),n&&this.isConnected&&(Oo(this,ko,this.getRootNode()?.getElementById(n)),(o=(a=Eo(this,ko))?.associateElement)==null||o.call(a,this)))}connectedCallback(){var e,t;let n=this.getAttribute(h.MEDIA_CONTROLLER);n&&(Oo(this,ko,this.getRootNode()?.getElementById(n)),(t=(e=Eo(this,ko))?.associateElement)==null||t.call(e,this))}disconnectedCallback(){var e,t;(t=(e=Eo(this,ko))?.unassociateElement)==null||t.call(e,this),Oo(this,ko,null)}get loadingDelay(){return Eo(this,Ao)}set loadingDelay(e){Oo(this,Ao,e);let{style:t}=E(this.shadowRoot,`:host`);t.setProperty(`--_loading-indicator-delay`,`var(--media-loading-indicator-transition-delay, ${e}ms)`)}get mediaPaused(){return k(this,v.MEDIA_PAUSED)}set mediaPaused(e){A(this,v.MEDIA_PAUSED,e)}get mediaLoading(){return k(this,v.MEDIA_LOADING)}set mediaLoading(e){A(this,v.MEDIA_LOADING,e)}get mediaController(){return j(this,h.MEDIA_CONTROLLER)}set mediaController(e){M(this,h.MEDIA_CONTROLLER,e)}get noAutohide(){return k(this,jo.NO_AUTOHIDE)}set noAutohide(e){A(this,jo.NO_AUTOHIDE,e)}};ko=new WeakMap,Ao=new WeakMap,Fo.shadowRootOptions={mode:`open`},Fo.getTemplateHTML=Po,w.customElements.get(`media-loading-indicator`)||w.customElements.define(`media-loading-indicator`,Fo);var Io=Fo,Lo=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M16.5 12A4.5 4.5 0 0 0 14 8v2.18l2.45 2.45a4.22 4.22 0 0 0 .05-.63Zm2.5 0a6.84 6.84 0 0 1-.54 2.64L20 16.15A8.8 8.8 0 0 0 21 12a9 9 0 0 0-7-8.77v2.06A7 7 0 0 1 19 12ZM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25A6.92 6.92 0 0 1 14 18.7v2.06A9 9 0 0 0 17.69 19l2 2.05L21 19.73l-9-9L4.27 3ZM12 4 9.91 6.09 12 8.18V4Z"/>
</svg>`,Ro=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4Z"/>
</svg>`,zo=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4ZM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54Z"/>
</svg>`;function Bo(e){return`
    <style>
      :host(:not([${v.MEDIA_VOLUME_LEVEL}])) slot[name=icon] slot:not([name=high]),
      :host([${v.MEDIA_VOLUME_LEVEL}=high]) slot[name=icon] slot:not([name=high]) {
        display: none !important;
      }

      :host([${v.MEDIA_VOLUME_LEVEL}=off]) slot[name=icon] slot:not([name=off]) {
        display: none !important;
      }

      :host([${v.MEDIA_VOLUME_LEVEL}=low]) slot[name=icon] slot:not([name=low]) {
        display: none !important;
      }

      :host([${v.MEDIA_VOLUME_LEVEL}=medium]) slot[name=icon] slot:not([name=medium]) {
        display: none !important;
      }

      :host(:not([${v.MEDIA_VOLUME_LEVEL}=off])) slot[name=tooltip-unmute],
      :host([${v.MEDIA_VOLUME_LEVEL}=off]) slot[name=tooltip-mute] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="off">${Lo}</slot>
      <slot name="low">${Ro}</slot>
      <slot name="medium">${Ro}</slot>
      <slot name="high">${zo}</slot>
    </slot>
  `}function Vo(){return`
    <slot name="tooltip-mute">${C(`Mute`)}</slot>
    <slot name="tooltip-unmute">${C(`Unmute`)}</slot>
  `}var Ho=e=>{let t=e.mediaVolumeLevel===`off`?C(`unmute`):C(`mute`);e.setAttribute(`aria-label`,t)},Uo=class extends U{static get observedAttributes(){return[...super.observedAttributes,v.MEDIA_VOLUME_LEVEL]}connectedCallback(){super.connectedCallback(),Ho(this)}attributeChangedCallback(e,t,n){super.attributeChangedCallback(e,t,n),e===v.MEDIA_VOLUME_LEVEL&&Ho(this)}get mediaVolumeLevel(){return j(this,v.MEDIA_VOLUME_LEVEL)}set mediaVolumeLevel(e){M(this,v.MEDIA_VOLUME_LEVEL,e)}handleClick(){let e=this.mediaVolumeLevel===`off`?m.MEDIA_UNMUTE_REQUEST:m.MEDIA_MUTE_REQUEST;this.dispatchEvent(new w.CustomEvent(e,{composed:!0,bubbles:!0}))}};Uo.getSlotTemplateHTML=Bo,Uo.getTooltipContentHTML=Vo,w.customElements.get(`media-mute-button`)||w.customElements.define(`media-mute-button`,Uo);var Wo=Uo,Go=`<svg aria-hidden="true" viewBox="0 0 28 24">
  <path d="M24 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Zm-1 16H5V5h18v14Zm-3-8h-7v5h7v-5Z"/>
</svg>`;function Ko(e){return`
    <style>
      :host([${v.MEDIA_IS_PIP}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      :host(:not([${v.MEDIA_IS_PIP}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${v.MEDIA_IS_PIP}]) slot[name=tooltip-enter],
      :host(:not([${v.MEDIA_IS_PIP}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${Go}</slot>
      <slot name="exit">${Go}</slot>
    </slot>
  `}function qo(){return`
    <slot name="tooltip-enter">${C(`Enter picture in picture mode`)}</slot>
    <slot name="tooltip-exit">${C(`Exit picture in picture mode`)}</slot>
  `}var Jo=e=>{let t=e.mediaIsPip?C(`exit picture in picture mode`):C(`enter picture in picture mode`);e.setAttribute(`aria-label`,t)},Yo=class extends U{static get observedAttributes(){return[...super.observedAttributes,v.MEDIA_IS_PIP,v.MEDIA_PIP_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),Jo(this)}attributeChangedCallback(e,t,n){super.attributeChangedCallback(e,t,n),e===v.MEDIA_IS_PIP&&Jo(this)}get mediaPipUnavailable(){return j(this,v.MEDIA_PIP_UNAVAILABLE)}set mediaPipUnavailable(e){M(this,v.MEDIA_PIP_UNAVAILABLE,e)}get mediaIsPip(){return k(this,v.MEDIA_IS_PIP)}set mediaIsPip(e){A(this,v.MEDIA_IS_PIP,e)}handleClick(){let e=this.mediaIsPip?m.MEDIA_EXIT_PIP_REQUEST:m.MEDIA_ENTER_PIP_REQUEST;this.dispatchEvent(new w.CustomEvent(e,{composed:!0,bubbles:!0}))}};Yo.getSlotTemplateHTML=Ko,Yo.getTooltipContentHTML=qo,w.customElements.get(`media-pip-button`)||w.customElements.define(`media-pip-button`,Yo);var Xo=Yo,Zo=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},Qo=(e,t,n)=>(Zo(e,t,`read from private field`),n?n.call(e):t.get(e)),$o=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},es,ts={RATES:`rates`},ns=[1,1.2,1.5,1.7,2];function rs(e){return Math.round(e*100)/100}function is(e){return`
    <style>
      :host {
        min-width: 5ch;
        padding: var(--media-button-padding, var(--media-control-padding, 10px 5px));
      }
    </style>
    <slot name="icon">${e.mediaplaybackrate?rs(+e.mediaplaybackrate):1}x</slot>
  `}function as(){return C(`Playback rate`)}var os=class extends U{constructor(){super(),$o(this,es,new Ht(this,ts.RATES,{defaultValue:ns})),this.container=this.shadowRoot.querySelector(`slot[name="icon"]`),this.container.innerHTML=`${rs(this.mediaPlaybackRate??1)}x`}static get observedAttributes(){return[...super.observedAttributes,v.MEDIA_PLAYBACK_RATE,ts.RATES]}attributeChangedCallback(e,t,n){if(super.attributeChangedCallback(e,t,n),e===ts.RATES&&(Qo(this,es).value=n),e===v.MEDIA_PLAYBACK_RATE){let e=n?+n:NaN,t=rs(Number.isNaN(e)?1:e);this.container.innerHTML=`${t}x`,this.setAttribute(`aria-label`,C(`Playback rate {playbackRate}`,{playbackRate:t}))}}get rates(){return Qo(this,es)}set rates(e){e?Array.isArray(e)?Qo(this,es).value=e.join(` `):typeof e==`string`&&(Qo(this,es).value=e):Qo(this,es).value=``}get mediaPlaybackRate(){return D(this,v.MEDIA_PLAYBACK_RATE,1)}set mediaPlaybackRate(e){O(this,v.MEDIA_PLAYBACK_RATE,e)}handleClick(){let e=Array.from(Qo(this,es).values(),e=>+e).sort((e,t)=>e-t),t=e.find(e=>e>this.mediaPlaybackRate)??e[0]??1,n=new w.CustomEvent(m.MEDIA_PLAYBACK_RATE_REQUEST,{composed:!0,bubbles:!0,detail:t});this.dispatchEvent(n)}};es=new WeakMap,os.getSlotTemplateHTML=is,os.getTooltipContentHTML=as,w.customElements.get(`media-playback-rate-button`)||w.customElements.define(`media-playback-rate-button`,os);var ss=os,cs=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="m6 21 15-9L6 3v18Z"/>
</svg>`,ls=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M6 20h4V4H6v16Zm8-16v16h4V4h-4Z"/>
</svg>`;function us(e){return`
    <style>
      :host([${v.MEDIA_PAUSED}]) slot[name=pause],
      :host(:not([${v.MEDIA_PAUSED}])) slot[name=play] {
        display: none !important;
      }

      :host([${v.MEDIA_PAUSED}]) slot[name=tooltip-pause],
      :host(:not([${v.MEDIA_PAUSED}])) slot[name=tooltip-play] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="play">${cs}</slot>
      <slot name="pause">${ls}</slot>
    </slot>
  `}function ds(){return`
    <slot name="tooltip-play">${C(`Play`)}</slot>
    <slot name="tooltip-pause">${C(`Pause`)}</slot>
  `}var fs=e=>{let t=e.mediaPaused?C(`play`):C(`pause`);e.setAttribute(`aria-label`,t)},ps=class extends U{static get observedAttributes(){return[...super.observedAttributes,v.MEDIA_PAUSED,v.MEDIA_ENDED]}connectedCallback(){super.connectedCallback(),fs(this)}attributeChangedCallback(e,t,n){super.attributeChangedCallback(e,t,n),(e===v.MEDIA_PAUSED||e===v.MEDIA_LANG)&&fs(this)}get mediaPaused(){return k(this,v.MEDIA_PAUSED)}set mediaPaused(e){A(this,v.MEDIA_PAUSED,e)}handleClick(){let e=this.mediaPaused?m.MEDIA_PLAY_REQUEST:m.MEDIA_PAUSE_REQUEST;this.dispatchEvent(new w.CustomEvent(e,{composed:!0,bubbles:!0}))}};ps.getSlotTemplateHTML=us,ps.getTooltipContentHTML=ds,w.customElements.get(`media-play-button`)||w.customElements.define(`media-play-button`,ps);var ms=ps,hs={PLACEHOLDER_SRC:`placeholdersrc`,SRC:`src`};function gs(e){return`
    <style>
      :host {
        pointer-events: none;
        display: var(--media-poster-image-display, inline-block);
        box-sizing: border-box;
      }

      img {
        max-width: 100%;
        max-height: 100%;
        min-width: 100%;
        min-height: 100%;
        background-repeat: no-repeat;
        background-position: var(--media-poster-image-background-position, var(--media-object-position, center));
        background-size: var(--media-poster-image-background-size, var(--media-object-fit, contain));
        object-fit: var(--media-object-fit, contain);
        object-position: var(--media-object-position, center);
      }
    </style>

    <img part="poster img" aria-hidden="true" id="image"/>
  `}var _s=e=>{e.style.removeProperty(`background-image`)},vs=(e,t)=>{e.style[`background-image`]=`url('${t}')`},ys=class extends w.HTMLElement{static get observedAttributes(){return[hs.PLACEHOLDER_SRC,hs.SRC]}constructor(){if(super(),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);let e=Ne(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}this.image=this.shadowRoot.querySelector(`#image`)}attributeChangedCallback(e,t,n){e===hs.SRC&&(n==null?this.image.removeAttribute(hs.SRC):this.image.setAttribute(hs.SRC,n)),e===hs.PLACEHOLDER_SRC&&(n==null?_s(this.image):vs(this.image,n))}get placeholderSrc(){return j(this,hs.PLACEHOLDER_SRC)}set placeholderSrc(e){M(this,hs.SRC,e)}get src(){return j(this,hs.SRC)}set src(e){M(this,hs.SRC,e)}};ys.shadowRootOptions={mode:`open`},ys.getTemplateHTML=gs,w.customElements.get(`media-poster-image`)||w.customElements.define(`media-poster-image`,ys);var bs=ys,xs=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},Ss=(e,t,n)=>(xs(e,t,`read from private field`),n?n.call(e):t.get(e)),Cs=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},ws=(e,t,n,r)=>(xs(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),Ts,Es=class extends wa{constructor(){super(),Cs(this,Ts,void 0),ws(this,Ts,this.shadowRoot.querySelector(`slot`))}static get observedAttributes(){return[...super.observedAttributes,v.MEDIA_PREVIEW_CHAPTER,v.MEDIA_LANG]}attributeChangedCallback(e,t,n){if(super.attributeChangedCallback(e,t,n),(e===v.MEDIA_PREVIEW_CHAPTER||e===v.MEDIA_LANG)&&n!==t&&n!=null){if(Ss(this,Ts).textContent=n,n!==``){let e=C(`chapter: {chapterName}`,{chapterName:n});this.setAttribute(`aria-valuetext`,e)}else this.removeAttribute(`aria-valuetext`)}}get mediaPreviewChapter(){return j(this,v.MEDIA_PREVIEW_CHAPTER)}set mediaPreviewChapter(e){M(this,v.MEDIA_PREVIEW_CHAPTER,e)}};Ts=new WeakMap,w.customElements.get(`media-preview-chapter-display`)||w.customElements.define(`media-preview-chapter-display`,Es);var Ds=Es,Os=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},ks=(e,t,n)=>(Os(e,t,`read from private field`),n?n.call(e):t.get(e)),As=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},js=(e,t,n,r)=>(Os(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),Ms;function Ns(e){return`
    <style>
      :host {
        box-sizing: border-box;
        display: var(--media-control-display, var(--media-preview-thumbnail-display, inline-block));
        overflow: hidden;
      }

      img {
        display: none;
        position: relative;
      }
    </style>
    <img crossorigin loading="eager" decoding="async">
  `}var Ps=class extends w.HTMLElement{constructor(){if(super(),As(this,Ms,void 0),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);let e=Ne(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}}static get observedAttributes(){return[h.MEDIA_CONTROLLER,v.MEDIA_PREVIEW_IMAGE,v.MEDIA_PREVIEW_COORDS]}connectedCallback(){var e,t;let n=this.getAttribute(h.MEDIA_CONTROLLER);n&&(js(this,Ms,this.getRootNode()?.getElementById(n)),(t=(e=ks(this,Ms))?.associateElement)==null||t.call(e,this))}disconnectedCallback(){var e,t;(t=(e=ks(this,Ms))?.unassociateElement)==null||t.call(e,this),js(this,Ms,null)}attributeChangedCallback(e,t,n){var r,i,a,o;[v.MEDIA_PREVIEW_IMAGE,v.MEDIA_PREVIEW_COORDS].includes(e)&&this.update(),e===h.MEDIA_CONTROLLER&&(t&&((i=(r=ks(this,Ms))?.unassociateElement)==null||i.call(r,this),js(this,Ms,null)),n&&this.isConnected&&(js(this,Ms,this.getRootNode()?.getElementById(n)),(o=(a=ks(this,Ms))?.associateElement)==null||o.call(a,this)))}get mediaPreviewImage(){return j(this,v.MEDIA_PREVIEW_IMAGE)}set mediaPreviewImage(e){M(this,v.MEDIA_PREVIEW_IMAGE,e)}get mediaPreviewCoords(){let e=this.getAttribute(v.MEDIA_PREVIEW_COORDS);if(e)return e.split(/\s+/).map(e=>+e)}set mediaPreviewCoords(e){e?this.setAttribute(v.MEDIA_PREVIEW_COORDS,e.join(` `)):this.removeAttribute(v.MEDIA_PREVIEW_COORDS)}update(){let e=this.mediaPreviewCoords,t=this.mediaPreviewImage;if(!(e&&t))return;let[n,r,i,a]=e,o=t.split(`#`)[0],s=getComputedStyle(this),{maxWidth:c,maxHeight:l,minWidth:u,minHeight:d}=s,f=s.getPropertyValue(`--media-preview-thumbnail-object-fit`).trim()||`contain`,p,m;if(f===`fill`){let e=parseInt(c)/i,t=parseInt(l)/a,n=parseInt(u)/i,r=parseInt(d)/a;p=e<1?e:Math.max(e,n),m=t<1?t:Math.max(t,r)}else{let e=Math.min(parseInt(c)/i,parseInt(l)/a),t=Math.max(parseInt(u)/i,parseInt(d)/a),n=e<1?e:t>1?t:1;p=n,m=n}let{style:h}=E(this.shadowRoot,`:host`),g=E(this.shadowRoot,`img`).style,_=this.shadowRoot.querySelector(`img`),v=Math.min(p,m)<1?`min`:`max`;h.setProperty(`${v}-width`,`initial`,`important`),h.setProperty(`${v}-height`,`initial`,`important`),h.width=`${i*p}px`,h.height=`${a*m}px`;let y=()=>{g.width=`${this.imgWidth*p}px`,g.height=`${this.imgHeight*m}px`,g.display=`block`};_.src!==o&&(_.onload=()=>{this.imgWidth=_.naturalWidth,this.imgHeight=_.naturalHeight,y(),_.onload=null},_.src=o,y()),y(),g.transform=`translate(-${n*p}px, -${r*m}px)`}};Ms=new WeakMap,Ps.shadowRootOptions={mode:`open`},Ps.getTemplateHTML=Ns,w.customElements.get(`media-preview-thumbnail`)||w.customElements.define(`media-preview-thumbnail`,Ps);var Fs=Ps,Is=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},Ls=(e,t,n)=>(Is(e,t,`read from private field`),n?n.call(e):t.get(e)),Rs=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},zs=(e,t,n,r)=>(Is(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),Bs,Vs=class extends wa{constructor(){super(),Rs(this,Bs,void 0),zs(this,Bs,this.shadowRoot.querySelector(`slot`)),Ls(this,Bs).textContent=ye(0)}static get observedAttributes(){return[...super.observedAttributes,v.MEDIA_PREVIEW_TIME]}attributeChangedCallback(e,t,n){super.attributeChangedCallback(e,t,n),e===v.MEDIA_PREVIEW_TIME&&n!=null&&(Ls(this,Bs).textContent=ye(parseFloat(n)))}get mediaPreviewTime(){return D(this,v.MEDIA_PREVIEW_TIME)}set mediaPreviewTime(e){O(this,v.MEDIA_PREVIEW_TIME,e)}};Bs=new WeakMap,w.customElements.get(`media-preview-time-display`)||w.customElements.define(`media-preview-time-display`,Vs);var Hs=Vs,Us={SEEK_OFFSET:`seekoffset`},Ws=30,Gs=e=>`
  <svg aria-hidden="true" viewBox="0 0 20 24">
    <defs>
      <style>.text{font-size:8px;font-family:Arial-BoldMT, Arial;font-weight:700;}</style>
    </defs>
    <text class="text value" transform="translate(2.18 19.87)">${e}</text>
    <path d="M10 6V3L4.37 7 10 10.94V8a5.54 5.54 0 0 1 1.9 10.48v2.12A7.5 7.5 0 0 0 10 6Z"/>
  </svg>`;function Ks(e,t){return`
    <slot name="icon">${Gs(t.seekOffset)}</slot>
  `}var qs=(e,t)=>{e.setAttribute(`aria-label`,C(`seek back {seekOffset} seconds`,{seekOffset:t}))};function Js(){return C(`Seek backward`)}var Ys=0,Xs=class extends U{static get observedAttributes(){return[...super.observedAttributes,v.MEDIA_CURRENT_TIME,Us.SEEK_OFFSET]}connectedCallback(){super.connectedCallback(),this.seekOffset=D(this,Us.SEEK_OFFSET,Ws)}attributeChangedCallback(e,t,n){super.attributeChangedCallback(e,t,n),qs(this,this.seekOffset),e===Us.SEEK_OFFSET&&(this.seekOffset=D(this,Us.SEEK_OFFSET,Ws))}get seekOffset(){return D(this,Us.SEEK_OFFSET,Ws)}set seekOffset(e){O(this,Us.SEEK_OFFSET,e),this.setAttribute(`aria-label`,C(`seek back {seekOffset} seconds`,{seekOffset:this.seekOffset})),Ie(Re(this,`icon`),this.seekOffset)}get mediaCurrentTime(){return D(this,v.MEDIA_CURRENT_TIME,Ys)}set mediaCurrentTime(e){O(this,v.MEDIA_CURRENT_TIME,e)}handleClick(){let e=Math.max(this.mediaCurrentTime-this.seekOffset,0),t=new w.CustomEvent(m.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:e});this.dispatchEvent(t)}};Xs.getSlotTemplateHTML=Ks,Xs.getTooltipContentHTML=Js,w.customElements.get(`media-seek-backward-button`)||w.customElements.define(`media-seek-backward-button`,Xs);var Zs=Xs,Qs={SEEK_OFFSET:`seekoffset`},$s=30,ec=e=>`
  <svg aria-hidden="true" viewBox="0 0 20 24">
    <defs>
      <style>.text{font-size:8px;font-family:Arial-BoldMT, Arial;font-weight:700;}</style>
    </defs>
    <text class="text value" transform="translate(8.9 19.87)">${e}</text>
    <path d="M10 6V3l5.61 4L10 10.94V8a5.54 5.54 0 0 0-1.9 10.48v2.12A7.5 7.5 0 0 1 10 6Z"/>
  </svg>`;function tc(e,t){return`
    <slot name="icon">${ec(t.seekOffset)}</slot>
  `}var nc=(e,t)=>{e.setAttribute(`aria-label`,C(`seek forward {seekOffset} seconds`,{seekOffset:t}))};function rc(){return C(`Seek forward`)}var ic=0,ac=class extends U{static get observedAttributes(){return[...super.observedAttributes,v.MEDIA_CURRENT_TIME,Qs.SEEK_OFFSET]}connectedCallback(){super.connectedCallback(),this.seekOffset=D(this,Qs.SEEK_OFFSET,$s)}attributeChangedCallback(e,t,n){super.attributeChangedCallback(e,t,n),nc(this,this.seekOffset),e===Qs.SEEK_OFFSET&&(this.seekOffset=D(this,Qs.SEEK_OFFSET,$s))}get seekOffset(){return D(this,Qs.SEEK_OFFSET,$s)}set seekOffset(e){O(this,Qs.SEEK_OFFSET,e),this.setAttribute(`aria-label`,C(`seek forward {seekOffset} seconds`,{seekOffset:this.seekOffset})),Ie(Re(this,`icon`),this.seekOffset)}get mediaCurrentTime(){return D(this,v.MEDIA_CURRENT_TIME,ic)}set mediaCurrentTime(e){O(this,v.MEDIA_CURRENT_TIME,e)}handleClick(){let e=this.mediaCurrentTime+this.seekOffset,t=new w.CustomEvent(m.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:e});this.dispatchEvent(t)}};ac.getSlotTemplateHTML=tc,ac.getTooltipContentHTML=rc,w.customElements.get(`media-seek-forward-button`)||w.customElements.define(`media-seek-forward-button`,ac);var oc=ac,sc=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},cc=(e,t,n)=>(sc(e,t,`read from private field`),n?n.call(e):t.get(e)),lc=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},uc=(e,t,n,r)=>(sc(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),dc=(e,t,n)=>(sc(e,t,`access private method`),n),fc,pc,mc,hc,gc,_c,vc,yc,bc,xc,Sc,Cc={REMAINING:`remaining`,SHOW_DURATION:`showduration`,NO_TOGGLE:`notoggle`},wc=[...Object.values(Cc),v.MEDIA_CURRENT_TIME,v.MEDIA_DURATION,v.MEDIA_SEEKABLE],Tc=[`Enter`,` `],Ec=`&nbsp;/&nbsp;`,Dc=(e,{timesSep:t=Ec}={})=>{let n=e.mediaCurrentTime??0,[,r]=e.mediaSeekable??[],i=0;Number.isFinite(e.mediaDuration)?i=e.mediaDuration:Number.isFinite(r)&&(i=r);let a=e.remaining?ye(0-(i-n)):ye(n);return e.showDuration?`${a}${t}${ye(i)}`:a},Oc=e=>{let t=e.mediaCurrentTime,[,n]=e.mediaSeekable??[],r=null;if(Number.isFinite(e.mediaDuration)?r=e.mediaDuration:Number.isFinite(n)&&(r=n),t==null||r===null){e.setAttribute(`aria-description`,C(`video not loaded, unknown time.`));return}let i=e.remaining?ve(0-(r-t)):ve(t);if(!e.showDuration){e.setAttribute(`aria-description`,i);return}let a=C(`{currentTime} of {totalTime}`,{currentTime:i,totalTime:ve(r)});e.setAttribute(`aria-description`,a)};function kc(e,t){return`
    <slot>${Dc(t)}</slot>
  `}var Ac=e=>{e.setAttribute(`aria-label`,C(`playback time`))},jc=class extends wa{constructor(){super(),lc(this,hc),lc(this,_c),lc(this,yc),lc(this,xc),lc(this,fc,void 0),lc(this,pc,null),lc(this,mc,e=>{let{metaKey:t,altKey:n,key:r}=e;t||n||!Tc.includes(r)?this.removeEventListener(`keyup`,cc(this,pc)):this.addEventListener(`keyup`,cc(this,pc))}),uc(this,fc,this.shadowRoot.querySelector(`slot`)),cc(this,fc).innerHTML=`${Dc(this)}`}static get observedAttributes(){return[...super.observedAttributes,...wc,`disabled`]}connectedCallback(){let{style:e}=E(this.shadowRoot,`:host(:hover:not([notoggle]))`);e.setProperty(`cursor`,`var(--media-cursor, pointer)`),e.setProperty(`background`,`var(--media-control-hover-background, rgba(50 50 70 / .7))`),this.setAttribute(`aria-label`,C(`playback time`)),dc(this,yc,bc).call(this),super.connectedCallback()}toggleTimeDisplay(){this.noToggle||(this.hasAttribute(`remaining`)?this.removeAttribute(`remaining`):this.setAttribute(`remaining`,``))}disconnectedCallback(){this.disable(),dc(this,_c,vc).call(this),super.disconnectedCallback()}attributeChangedCallback(e,t,n){Ac(this),wc.includes(e)?this.update():e===`disabled`&&n!==t?n==null?dc(this,yc,bc).call(this):dc(this,xc,Sc).call(this):e===Cc.NO_TOGGLE&&n!==t&&(this.noToggle?dc(this,xc,Sc).call(this):dc(this,yc,bc).call(this)),super.attributeChangedCallback(e,t,n)}enable(){this.noToggle||(this.tabIndex=0)}disable(){this.tabIndex=-1}get remaining(){return k(this,Cc.REMAINING)}set remaining(e){A(this,Cc.REMAINING,e)}get showDuration(){return k(this,Cc.SHOW_DURATION)}set showDuration(e){A(this,Cc.SHOW_DURATION,e)}get noToggle(){return k(this,Cc.NO_TOGGLE)}set noToggle(e){A(this,Cc.NO_TOGGLE,e)}get mediaDuration(){return D(this,v.MEDIA_DURATION)}set mediaDuration(e){O(this,v.MEDIA_DURATION,e)}get mediaCurrentTime(){return D(this,v.MEDIA_CURRENT_TIME)}set mediaCurrentTime(e){O(this,v.MEDIA_CURRENT_TIME,e)}get mediaSeekable(){let e=this.getAttribute(v.MEDIA_SEEKABLE);if(e)return e.split(`:`).map(e=>+e)}set mediaSeekable(e){e==null?this.removeAttribute(v.MEDIA_SEEKABLE):this.setAttribute(v.MEDIA_SEEKABLE,e.join(`:`))}update(){let e=Dc(this);Oc(this),e!==cc(this,fc).innerHTML&&(cc(this,fc).innerHTML=e)}};fc=new WeakMap,pc=new WeakMap,mc=new WeakMap,hc=new WeakSet,gc=function(){cc(this,pc)||(uc(this,pc,e=>{let{key:t}=e;Tc.includes(t)?this.toggleTimeDisplay():this.removeEventListener(`keyup`,cc(this,pc))}),this.addEventListener(`keydown`,cc(this,mc)),this.addEventListener(`click`,this.toggleTimeDisplay))},_c=new WeakSet,vc=function(){cc(this,pc)&&(this.removeEventListener(`keyup`,cc(this,pc)),this.removeEventListener(`keydown`,cc(this,mc)),this.removeEventListener(`click`,this.toggleTimeDisplay),uc(this,pc,null))},yc=new WeakSet,bc=function(){!this.noToggle&&!this.hasAttribute(`disabled`)&&(this.setAttribute(`role`,`button`),this.enable(),dc(this,hc,gc).call(this))},xc=new WeakSet,Sc=function(){this.removeAttribute(`role`),this.disable(),dc(this,_c,vc).call(this)},jc.getSlotTemplateHTML=kc,w.customElements.get(`media-time-display`)||w.customElements.define(`media-time-display`,jc);var Mc=jc,Nc=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},K=(e,t,n)=>(Nc(e,t,`read from private field`),n?n.call(e):t.get(e)),Pc=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},q=(e,t,n,r)=>(Nc(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),Fc=(e,t,n,r)=>({set _(r){q(e,t,r,n)},get _(){return K(e,t,r)}}),Ic,Lc,Rc,zc,Bc,Vc,Hc,Uc,Wc,Gc,Kc=class{constructor(e,t,n){Pc(this,Ic,void 0),Pc(this,Lc,void 0),Pc(this,Rc,void 0),Pc(this,zc,void 0),Pc(this,Bc,void 0),Pc(this,Vc,void 0),Pc(this,Hc,void 0),Pc(this,Uc,void 0),Pc(this,Wc,0),Pc(this,Gc,(e=performance.now())=>{q(this,Wc,requestAnimationFrame(K(this,Gc))),q(this,zc,performance.now()-K(this,Rc));let t=1e3/this.fps;if(K(this,zc)>t){q(this,Rc,e-K(this,zc)%t);let n=1e3/((e-K(this,Lc))/++Fc(this,Bc)._),r=(e-K(this,Vc))/1e3/this.duration,i=K(this,Hc)+r*this.playbackRate;i-K(this,Ic).valueAsNumber>0?q(this,Uc,this.playbackRate/this.duration/n):(q(this,Uc,.995*K(this,Uc)),i=K(this,Ic).valueAsNumber+K(this,Uc)),this.callback(i)}}),q(this,Ic,e),this.callback=t,this.fps=n}start(){K(this,Wc)===0&&(q(this,Rc,performance.now()),q(this,Lc,K(this,Rc)),q(this,Bc,0),K(this,Gc).call(this))}stop(){K(this,Wc)!==0&&(cancelAnimationFrame(K(this,Wc)),q(this,Wc,0))}update({start:e,duration:t,playbackRate:n}){let r=e-K(this,Ic).valueAsNumber,i=Math.abs(t-this.duration);(r>0||r<-.5/t||i>=.5)&&this.callback(e),q(this,Hc,e),q(this,Vc,performance.now()),this.duration=t,this.playbackRate=n}};Ic=new WeakMap,Lc=new WeakMap,Rc=new WeakMap,zc=new WeakMap,Bc=new WeakMap,Vc=new WeakMap,Hc=new WeakMap,Uc=new WeakMap,Wc=new WeakMap,Gc=new WeakMap;var qc=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},J=(e,t,n)=>(qc(e,t,`read from private field`),n?n.call(e):t.get(e)),Y=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},X=(e,t,n,r)=>(qc(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),Z=(e,t,n)=>(qc(e,t,`access private method`),n),Jc,Yc,Xc,Zc,Qc,$c,el,tl,nl,rl,il,al,ol,sl,cl,ll,ul,dl,fl,pl,ml,hl,gl,_l,vl,yl,bl=e=>{let t=e.range,n=ve(+Cl(e)),r=ve(+e.mediaSeekableEnd),i=n&&r?C(`{currentTime} of {totalTime}`,{currentTime:n,totalTime:r}):C(`video not loaded, unknown time.`);t.setAttribute(`aria-valuetext`,i)};function xl(e){return`
    <style>
      :host {
        --media-box-border-radius: 4px;
        --media-box-padding-left: 10px;
        --media-box-padding-right: 10px;
        --media-preview-border-radius: var(--media-box-border-radius);
        --media-box-arrow-offset: var(--media-box-border-radius);
        --_control-background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        --_preview-background: var(--media-preview-background, var(--_control-background));

        
        contain: layout;
      }

      #buffered {
        background: var(--media-time-range-buffered-color, rgb(255 255 255 / .4));
        position: absolute;
        height: 100%;
        will-change: width;
      }

      #preview-rail,
      #current-rail {
        width: 100%;
        position: absolute;
        left: 0;
        bottom: 100%;
        pointer-events: none;
        will-change: transform;
      }

      [part~="box"] {
        width: min-content;
        
        position: absolute;
        bottom: 100%;
        flex-direction: column;
        align-items: center;
        transform: translateX(-50%);
      }

      [part~="current-box"] {
        display: var(--media-current-box-display, var(--media-box-display, flex));
        margin: var(--media-current-box-margin, var(--media-box-margin, 0 0 5px));
        visibility: hidden;
      }

      [part~="preview-box"] {
        display: var(--media-preview-box-display, var(--media-box-display, flex));
        margin: var(--media-preview-box-margin, var(--media-box-margin, 0 0 5px));
        transition-property: var(--media-preview-transition-property, visibility, opacity);
        transition-duration: var(--media-preview-transition-duration-out, .25s);
        transition-delay: var(--media-preview-transition-delay-out, 0s);
        visibility: hidden;
        opacity: 0;
      }

      :host(:is([${v.MEDIA_PREVIEW_IMAGE}], [${v.MEDIA_PREVIEW_TIME}])[dragging]) [part~="preview-box"] {
        transition-duration: var(--media-preview-transition-duration-in, .5s);
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        visibility: visible;
        opacity: 1;
      }

      @media (hover: hover) {
        :host(:is([${v.MEDIA_PREVIEW_IMAGE}], [${v.MEDIA_PREVIEW_TIME}]):hover) [part~="preview-box"] {
          transition-duration: var(--media-preview-transition-duration-in, .5s);
          transition-delay: var(--media-preview-transition-delay-in, .25s);
          visibility: visible;
          opacity: 1;
        }
      }

      media-preview-thumbnail,
      ::slotted(media-preview-thumbnail) {
        visibility: hidden;
        
        transition: visibility 0s .25s;
        transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
        background: var(--media-preview-thumbnail-background, var(--_preview-background));
        box-shadow: var(--media-preview-thumbnail-box-shadow, 0 0 4px rgb(0 0 0 / .2));
        max-width: var(--media-preview-thumbnail-max-width, 180px);
        max-height: var(--media-preview-thumbnail-max-height, 160px);
        min-width: var(--media-preview-thumbnail-min-width, 120px);
        min-height: var(--media-preview-thumbnail-min-height, 80px);
        border: var(--media-preview-thumbnail-border);
        border-radius: var(--media-preview-thumbnail-border-radius,
          var(--media-preview-border-radius) var(--media-preview-border-radius) 0 0);
      }

      :host([${v.MEDIA_PREVIEW_IMAGE}][dragging]) media-preview-thumbnail,
      :host([${v.MEDIA_PREVIEW_IMAGE}][dragging]) ::slotted(media-preview-thumbnail) {
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        visibility: visible;
      }

      @media (hover: hover) {
        :host([${v.MEDIA_PREVIEW_IMAGE}]:hover) media-preview-thumbnail,
        :host([${v.MEDIA_PREVIEW_IMAGE}]:hover) ::slotted(media-preview-thumbnail) {
          transition-delay: var(--media-preview-transition-delay-in, .25s);
          visibility: visible;
        }

        :host([${v.MEDIA_PREVIEW_TIME}]:hover) {
          --media-time-range-hover-display: block;
        }
      }

      media-preview-chapter-display,
      ::slotted(media-preview-chapter-display) {
        font-size: var(--media-font-size, 13px);
        line-height: 17px;
        min-width: 0;
        visibility: hidden;
        
        transition: min-width 0s, border-radius 0s, margin 0s, padding 0s, visibility 0s;
        transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
        background: var(--media-preview-chapter-background, var(--_preview-background));
        border-radius: var(--media-preview-chapter-border-radius,
          var(--media-preview-border-radius) var(--media-preview-border-radius)
          var(--media-preview-border-radius) var(--media-preview-border-radius));
        padding: var(--media-preview-chapter-padding, 3.5px 9px);
        margin: var(--media-preview-chapter-margin, 0 0 5px);
        text-shadow: var(--media-preview-chapter-text-shadow, 0 0 4px rgb(0 0 0 / .75));
      }

      :host([${v.MEDIA_PREVIEW_IMAGE}]) media-preview-chapter-display,
      :host([${v.MEDIA_PREVIEW_IMAGE}]) ::slotted(media-preview-chapter-display) {
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        border-radius: var(--media-preview-chapter-border-radius, 0);
        padding: var(--media-preview-chapter-padding, 3.5px 9px 0);
        margin: var(--media-preview-chapter-margin, 0);
        min-width: 100%;
      }

      media-preview-chapter-display[${v.MEDIA_PREVIEW_CHAPTER}],
      ::slotted(media-preview-chapter-display[${v.MEDIA_PREVIEW_CHAPTER}]) {
        visibility: visible;
      }

      media-preview-chapter-display:not([aria-valuetext]),
      ::slotted(media-preview-chapter-display:not([aria-valuetext])) {
        display: none;
      }

      media-preview-time-display,
      ::slotted(media-preview-time-display),
      media-time-display,
      ::slotted(media-time-display) {
        font-size: var(--media-font-size, 13px);
        line-height: 17px;
        min-width: 0;
        
        transition: min-width 0s, border-radius 0s;
        transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
        background: var(--media-preview-time-background, var(--_preview-background));
        border-radius: var(--media-preview-time-border-radius,
          var(--media-preview-border-radius) var(--media-preview-border-radius)
          var(--media-preview-border-radius) var(--media-preview-border-radius));
        padding: var(--media-preview-time-padding, 3.5px 9px);
        margin: var(--media-preview-time-margin, 0);
        text-shadow: var(--media-preview-time-text-shadow, 0 0 4px rgb(0 0 0 / .75));
        transform: translateX(min(
          max(calc(50% - var(--_box-width) / 2),
          calc(var(--_box-shift, 0))),
          calc(var(--_box-width) / 2 - 50%)
        ));
      }

      :host([${v.MEDIA_PREVIEW_IMAGE}]) media-preview-time-display,
      :host([${v.MEDIA_PREVIEW_IMAGE}]) ::slotted(media-preview-time-display) {
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        border-radius: var(--media-preview-time-border-radius,
          0 0 var(--media-preview-border-radius) var(--media-preview-border-radius));
        min-width: 100%;
      }

      :host([${v.MEDIA_PREVIEW_TIME}]:hover) {
        --media-time-range-hover-display: block;
      }

      [part~="arrow"],
      ::slotted([part~="arrow"]) {
        display: var(--media-box-arrow-display, inline-block);
        transform: translateX(min(
          max(calc(50% - var(--_box-width) / 2 + var(--media-box-arrow-offset)),
          calc(var(--_box-shift, 0))),
          calc(var(--_box-width) / 2 - 50% - var(--media-box-arrow-offset))
        ));
        
        border-color: transparent;
        border-top-color: var(--media-box-arrow-background, var(--_control-background));
        border-width: var(--media-box-arrow-border-width,
          var(--media-box-arrow-height, 5px) var(--media-box-arrow-width, 6px) 0);
        border-style: solid;
        justify-content: center;
        height: 0;
      }
    </style>
    <div id="preview-rail">
      <slot name="preview" part="box preview-box">
        <media-preview-thumbnail>
          <template shadowrootmode="${Fs.shadowRootOptions.mode}">
            ${Fs.getTemplateHTML({})}
          </template>
        </media-preview-thumbnail>
        <media-preview-chapter-display></media-preview-chapter-display>
        <media-preview-time-display></media-preview-time-display>
        <slot name="preview-arrow"><div part="arrow"></div></slot>
      </slot>
    </div>
    <div id="current-rail">
      <slot name="current" part="box current-box">
        
      </slot>
    </div>
  `}var Sl=(e,t=e.mediaCurrentTime)=>{let n=Number.isFinite(e.mediaSeekableStart)?e.mediaSeekableStart:0,r=Number.isFinite(e.mediaDuration)?e.mediaDuration:e.mediaSeekableEnd;if(Number.isNaN(r))return 0;let i=(t-n)/(r-n);return Math.max(0,Math.min(i,1))},Cl=(e,t=e.range.valueAsNumber)=>{let n=Number.isFinite(e.mediaSeekableStart)?e.mediaSeekableStart:0,r=Number.isFinite(e.mediaDuration)?e.mediaDuration:e.mediaSeekableEnd;return Number.isNaN(r)?0:t*(r-n)+n},wl=class extends sa{constructor(){super(),Y(this,al),Y(this,cl),Y(this,ul),Y(this,fl),Y(this,ml),Y(this,gl),Y(this,vl),Y(this,Jc,null),Y(this,Yc,void 0),Y(this,Xc,void 0),Y(this,Zc,void 0),Y(this,Qc,void 0),Y(this,$c,void 0),Y(this,el,void 0),Y(this,tl,void 0),Y(this,nl,void 0),Y(this,rl,void 0),Y(this,il,()=>{Z(this,al,ol).call(this)?J(this,Yc).start():J(this,Yc).stop()}),Y(this,sl,e=>{this.dragging||(ce(e)&&(this.range.valueAsNumber=e),J(this,rl)||this.updateBar())}),this.shadowRoot.querySelector(`#track`).insertAdjacentHTML(`afterbegin`,`<div id="buffered" part="buffered"></div>`),X(this,Xc,this.shadowRoot.querySelectorAll(`[part~="box"]`)),X(this,Qc,this.shadowRoot.querySelector(`[part~="preview-box"]`)),X(this,$c,this.shadowRoot.querySelector(`[part~="current-box"]`));let e=getComputedStyle(this);X(this,el,parseInt(e.getPropertyValue(`--media-box-padding-left`))),X(this,tl,parseInt(e.getPropertyValue(`--media-box-padding-right`))),X(this,Yc,new Kc(this.range,J(this,sl),60))}static get observedAttributes(){return[...super.observedAttributes,v.MEDIA_PAUSED,v.MEDIA_DURATION,v.MEDIA_SEEKABLE,v.MEDIA_CURRENT_TIME,v.MEDIA_PREVIEW_IMAGE,v.MEDIA_PREVIEW_TIME,v.MEDIA_PREVIEW_CHAPTER,v.MEDIA_BUFFERED,v.MEDIA_PLAYBACK_RATE,v.MEDIA_LOADING,v.MEDIA_ENDED]}connectedCallback(){var e;super.connectedCallback(),this.range.setAttribute(`aria-label`,C(`seek`)),J(this,il).call(this),X(this,Jc,this.getRootNode()),(e=J(this,Jc))==null||e.addEventListener(`transitionstart`,this)}disconnectedCallback(){var e;super.disconnectedCallback(),J(this,Yc).stop(),(e=J(this,Jc))==null||e.removeEventListener(`transitionstart`,this),X(this,Jc,null)}attributeChangedCallback(e,t,n){super.attributeChangedCallback(e,t,n),t!=n&&(e===v.MEDIA_CURRENT_TIME||e===v.MEDIA_PAUSED||e===v.MEDIA_ENDED||e===v.MEDIA_LOADING||e===v.MEDIA_DURATION||e===v.MEDIA_SEEKABLE?(J(this,Yc).update({start:Sl(this),duration:this.mediaSeekableEnd-this.mediaSeekableStart,playbackRate:this.mediaPlaybackRate}),J(this,il).call(this),bl(this)):e===v.MEDIA_BUFFERED&&this.updateBufferedBar(),(e===v.MEDIA_DURATION||e===v.MEDIA_SEEKABLE)&&(this.mediaChaptersCues=J(this,nl),this.updateBar()))}get mediaChaptersCues(){return J(this,nl)}set mediaChaptersCues(e){X(this,nl,e),this.updateSegments(J(this,nl)?.map(e=>({start:Sl(this,e.startTime),end:Sl(this,e.endTime)})))}get mediaPaused(){return k(this,v.MEDIA_PAUSED)}set mediaPaused(e){A(this,v.MEDIA_PAUSED,e)}get mediaLoading(){return k(this,v.MEDIA_LOADING)}set mediaLoading(e){A(this,v.MEDIA_LOADING,e)}get mediaDuration(){return D(this,v.MEDIA_DURATION)}set mediaDuration(e){O(this,v.MEDIA_DURATION,e)}get mediaCurrentTime(){return D(this,v.MEDIA_CURRENT_TIME)}set mediaCurrentTime(e){O(this,v.MEDIA_CURRENT_TIME,e)}get mediaPlaybackRate(){return D(this,v.MEDIA_PLAYBACK_RATE,1)}set mediaPlaybackRate(e){O(this,v.MEDIA_PLAYBACK_RATE,e)}get mediaBuffered(){let e=this.getAttribute(v.MEDIA_BUFFERED);return e?e.split(` `).map(e=>e.split(`:`).map(e=>+e)):[]}set mediaBuffered(e){if(!e){this.removeAttribute(v.MEDIA_BUFFERED);return}let t=e.map(e=>e.join(`:`)).join(` `);this.setAttribute(v.MEDIA_BUFFERED,t)}get mediaSeekable(){let e=this.getAttribute(v.MEDIA_SEEKABLE);if(e)return e.split(`:`).map(e=>+e)}set mediaSeekable(e){e==null?this.removeAttribute(v.MEDIA_SEEKABLE):this.setAttribute(v.MEDIA_SEEKABLE,e.join(`:`))}get mediaSeekableEnd(){let[,e=this.mediaDuration]=this.mediaSeekable??[];return e}get mediaSeekableStart(){let[e=0]=this.mediaSeekable??[];return e}get mediaPreviewImage(){return j(this,v.MEDIA_PREVIEW_IMAGE)}set mediaPreviewImage(e){M(this,v.MEDIA_PREVIEW_IMAGE,e)}get mediaPreviewTime(){return D(this,v.MEDIA_PREVIEW_TIME)}set mediaPreviewTime(e){O(this,v.MEDIA_PREVIEW_TIME,e)}get mediaEnded(){return k(this,v.MEDIA_ENDED)}set mediaEnded(e){A(this,v.MEDIA_ENDED,e)}updateBar(){super.updateBar(),this.updateBufferedBar(),this.updateCurrentBox()}updateBufferedBar(){let e=this.mediaBuffered;if(!e.length)return;let t;if(this.mediaEnded)t=1;else{let n=this.mediaCurrentTime,[,r=this.mediaSeekableStart]=e.find(([e,t])=>e<=n&&n<=t)??[];t=Sl(this,r)}let{style:n}=E(this.shadowRoot,`#buffered`);n.setProperty(`width`,`${t*100}%`)}updateCurrentBox(){if(!this.shadowRoot.querySelector(`slot[name="current"]`).assignedElements().length)return;let e=E(this.shadowRoot,`#current-rail`),t=E(this.shadowRoot,`[part~="current-box"]`),n=Z(this,cl,ll).call(this,J(this,$c)),r=Z(this,ul,dl).call(this,n,this.range.valueAsNumber),i=Z(this,fl,pl).call(this,n,this.range.valueAsNumber);e.style.transform=`translateX(${r})`,e.style.setProperty(`--_range-width`,`${n.range.width}`),t.style.setProperty(`--_box-shift`,`${i}`),t.style.setProperty(`--_box-width`,`${n.box.width}px`),t.style.setProperty(`visibility`,`initial`)}handleEvent(e){switch(super.handleEvent(e),e.type){case`input`:Z(this,vl,yl).call(this);break;case`pointermove`:Z(this,ml,hl).call(this,e);break;case`pointerup`:J(this,rl)&&X(this,rl,!1);break;case`pointerdown`:X(this,rl,!0);break;case`pointerleave`:Z(this,gl,_l).call(this,null);break;case`transitionstart`:ze(e.target,this)&&setTimeout(()=>J(this,il).call(this),0)}}};Jc=new WeakMap,Yc=new WeakMap,Xc=new WeakMap,Zc=new WeakMap,Qc=new WeakMap,$c=new WeakMap,el=new WeakMap,tl=new WeakMap,nl=new WeakMap,rl=new WeakMap,il=new WeakMap,al=new WeakSet,ol=function(){return this.isConnected&&!this.mediaPaused&&!this.mediaLoading&&!this.mediaEnded&&this.mediaSeekableEnd>0&&Ue(this)},sl=new WeakMap,cl=new WeakSet,ll=function(e){let t=((this.getAttribute(`bounds`)?Be(this,`#${this.getAttribute(`bounds`)}`):this.parentElement)??this).getBoundingClientRect(),n=this.range.getBoundingClientRect(),r=e.offsetWidth;return{box:{width:r,min:-(n.left-t.left-r/2),max:t.right-n.left-r/2},bounds:t,range:n}},ul=new WeakSet,dl=function(e,t){let n=`${t*100}%`,{width:r,min:i,max:a}=e.box;if(!r)return n;if(Number.isNaN(i)||(n=`max(${`calc(1 / var(--_range-width) * 100 * ${i}% + var(--media-box-padding-left))`}, ${n})`),!Number.isNaN(a)){let e=`calc(1 / var(--_range-width) * 100 * ${a}% - var(--media-box-padding-right))`;n=`min(${n}, ${e})`}return n},fl=new WeakSet,pl=function(e,t){let{width:n,min:r,max:i}=e.box,a=t*e.range.width;if(a<r+J(this,el)){let t=e.range.left-e.bounds.left-J(this,el);return`${a-n/2+t}px`}if(a>i-J(this,tl)){let t=e.bounds.right-e.range.right-J(this,tl);return`${a+n/2-t-e.range.width}px`}return 0},ml=new WeakSet,hl=function(e){let t=[...J(this,Xc)].some(t=>e.composedPath().includes(t));if(!this.dragging&&(t||!e.composedPath().includes(this))){Z(this,gl,_l).call(this,null);return}let n=this.mediaSeekableEnd;if(!n)return;let r=E(this.shadowRoot,`#preview-rail`),i=E(this.shadowRoot,`[part~="preview-box"]`),a=Z(this,cl,ll).call(this,J(this,Qc)),o=(e.clientX-a.range.left)/a.range.width;o=Math.max(0,Math.min(1,o));let s=Z(this,ul,dl).call(this,a,o),c=Z(this,fl,pl).call(this,a,o);r.style.transform=`translateX(${s})`,r.style.setProperty(`--_range-width`,`${a.range.width}`),i.style.setProperty(`--_box-shift`,`${c}`),i.style.setProperty(`--_box-width`,`${a.box.width}px`);let l=Math.round(J(this,Zc))-Math.round(o*n);Math.abs(l)<1&&o>.01&&o<.99||(X(this,Zc,o*n),Z(this,gl,_l).call(this,J(this,Zc)))},gl=new WeakSet,_l=function(e){this.dispatchEvent(new w.CustomEvent(m.MEDIA_PREVIEW_REQUEST,{composed:!0,bubbles:!0,detail:e}))},vl=new WeakSet,yl=function(){J(this,Yc).stop();let e=Cl(this);this.dispatchEvent(new w.CustomEvent(m.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:e}))},wl.shadowRootOptions={mode:`open`},wl.getContainerTemplateHTML=xl,w.customElements.get(`media-time-range`)||w.customElements.define(`media-time-range`,wl);var Tl=wl,El=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},Dl=(e,t,n)=>(El(e,t,`read from private field`),n?n.call(e):t.get(e)),Ol=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},kl,Al=1,jl=e=>e.mediaMuted?0:e.mediaVolume,Ml=e=>`${Math.round(e*100)}%`,Nl=class extends sa{constructor(){super(...arguments),Ol(this,kl,()=>{let e=this.range.value,t=new w.CustomEvent(m.MEDIA_VOLUME_REQUEST,{composed:!0,bubbles:!0,detail:e});this.dispatchEvent(t)})}static get observedAttributes(){return[...super.observedAttributes,v.MEDIA_VOLUME,v.MEDIA_MUTED,v.MEDIA_VOLUME_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),this.range.setAttribute(`aria-label`,C(`volume`)),this.range.addEventListener(`input`,Dl(this,kl))}disconnectedCallback(){this.range.removeEventListener(`input`,Dl(this,kl)),super.disconnectedCallback()}attributeChangedCallback(e,t,n){super.attributeChangedCallback(e,t,n),(e===v.MEDIA_VOLUME||e===v.MEDIA_MUTED)&&(this.range.valueAsNumber=jl(this),this.range.setAttribute(`aria-valuetext`,Ml(this.range.valueAsNumber)),this.updateBar())}get mediaVolume(){return D(this,v.MEDIA_VOLUME,Al)}set mediaVolume(e){O(this,v.MEDIA_VOLUME,e)}get mediaMuted(){return k(this,v.MEDIA_MUTED)}set mediaMuted(e){A(this,v.MEDIA_MUTED,e)}get mediaVolumeUnavailable(){return j(this,v.MEDIA_VOLUME_UNAVAILABLE)}set mediaVolumeUnavailable(e){M(this,v.MEDIA_VOLUME_UNAVAILABLE,e)}};kl=new WeakMap,w.customElements.get(`media-volume-range`)||w.customElements.define(`media-volume-range`,Nl);var Pl=Nl;function Fl(e){return`
      <style>
        :host {
          min-width: 4ch;
          padding: var(--media-button-padding, var(--media-control-padding, 10px 5px));
          width: 100%;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 1rem;
          font-weight: var(--media-button-font-weight, normal);
        }

        #checked-indicator {
          display: none;
        }

        :host([${v.MEDIA_LOOP}]) #checked-indicator {
          display: block;
        }
      </style>
      
      <span id="icon">
     </span>

      <div id="checked-indicator">
        <svg aria-hidden="true" viewBox="0 1 24 24" part="checked-indicator indicator">
          <path d="m10 15.17 9.193-9.191 1.414 1.414-10.606 10.606-6.364-6.364 1.414-1.414 4.95 4.95Z"/>
        </svg>
      </div>
    `}function Il(){return C(`Loop`)}var Ll=class extends U{constructor(){super(...arguments),this.container=null}static get observedAttributes(){return[...super.observedAttributes,v.MEDIA_LOOP]}connectedCallback(){super.connectedCallback(),this.container=this.shadowRoot?.querySelector(`#icon`)||null,this.container&&(this.container.textContent=C(`Loop`))}attributeChangedCallback(e,t,n){super.attributeChangedCallback(e,t,n),e===v.MEDIA_LOOP&&this.container&&this.setAttribute(`aria-checked`,this.mediaLoop?`true`:`false`)}get mediaLoop(){return k(this,v.MEDIA_LOOP)}set mediaLoop(e){A(this,v.MEDIA_LOOP,e)}handleClick(){let e=!this.mediaLoop,t=new w.CustomEvent(m.MEDIA_LOOP_REQUEST,{composed:!0,bubbles:!0,detail:e});this.dispatchEvent(t)}};Ll.getSlotTemplateHTML=Fl,Ll.getTooltipContentHTML=Il,w.customElements.get(`media-loop-button`)||w.customElements.define(`media-loop-button`,Ll);var Rl=Ll;function Q(e){if(typeof e==`boolean`)return e?``:void 0;if(typeof e!=`function`){if(Array.isArray(e)&&e.every(e=>typeof e==`string`||typeof e==`number`||typeof e==`boolean`))return e.join(` `);if(!(typeof e==`object`&&e))return e}}f({tagName:`media-gesture-receiver`,elementClass:et,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}}),f({tagName:`media-container`,elementClass:Mt,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}});var zl=f({tagName:`media-controller`,elementClass:_r,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}});f({tagName:`media-tooltip`,elementClass:xr,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}}),f({tagName:`media-chrome-button`,elementClass:Lr,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}}),f({tagName:`media-airplay-button`,elementClass:Ur,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}});var Bl=f({tagName:`media-captions-button`,elementClass:Qr,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}});f({tagName:`media-cast-button`,elementClass:ai,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}}),f({tagName:`media-chrome-dialog`,elementClass:Ai,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}}),f({tagName:`media-chrome-range`,elementClass:ca,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}});var Vl=f({tagName:`media-control-bar`,elementClass:ga,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}});f({tagName:`media-text-display`,elementClass:Ta,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}}),f({tagName:`media-duration-display`,elementClass:Na,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}}),f({tagName:`media-error-dialog`,elementClass:qa,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}}),f({tagName:`media-keyboard-shortcuts-dialog`,elementClass:no,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}});var Hl=f({tagName:`media-fullscreen-button`,elementClass:ho,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}});f({tagName:`media-live-button`,elementClass:wo,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}}),f({tagName:`media-loading-indicator`,elementClass:Io,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}});var Ul=f({tagName:`media-mute-button`,elementClass:Wo,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}});f({tagName:`media-pip-button`,elementClass:Xo,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}});var Wl=f({tagName:`media-playback-rate-button`,elementClass:ss,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}}),Gl=f({tagName:`media-play-button`,elementClass:ms,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}});f({tagName:`media-poster-image`,elementClass:bs,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}}),f({tagName:`media-preview-chapter-display`,elementClass:Ds,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}}),f({tagName:`media-preview-thumbnail`,elementClass:Fs,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}}),f({tagName:`media-preview-time-display`,elementClass:Hs,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}});var Kl=f({tagName:`media-seek-backward-button`,elementClass:Zs,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}}),ql=f({tagName:`media-seek-forward-button`,elementClass:oc,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}}),Jl=f({tagName:`media-time-display`,elementClass:Mc,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}}),Yl=f({tagName:`media-time-range`,elementClass:Tl,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}}),Xl=f({tagName:`media-volume-range`,elementClass:Pl,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}});f({tagName:`media-loop-button`,elementClass:Rl,react:s.default,toAttributeValue:Q,defaultProps:{suppressHydrationWarning:!0}});var $=a();r({file:o});function Zl(e){return{Play:e(`file.playerPlay`),play:e(`file.playerPlay`),Pause:e(`file.playerPause`),pause:e(`file.playerPause`),Mute:e(`file.playerMute`),mute:e(`file.playerMute`),Unmute:e(`file.playerUnmute`),unmute:e(`file.playerUnmute`),volume:e(`file.playerVolume`),seek:e(`file.playerSeek`),Captions:e(`file.playerCaptions`),"closed captions":e(`file.playerCaptions`),"Enable captions":e(`file.playerCaptionsOn`),"Disable captions":e(`file.playerCaptionsOff`),"Enter fullscreen mode":e(`file.playerFullscreenEnter`),"enter fullscreen mode":e(`file.playerFullscreenEnter`),"Exit fullscreen mode":e(`file.playerFullscreenExit`),"exit fullscreen mode":e(`file.playerFullscreenExit`),"Playback rate":e(`file.playerPlaybackRate`),"current playback rate":e(`file.playerPlaybackRate`),"Playback rate {playbackRate}":e(`file.playerPlaybackRateValue`),"Seek backward":e(`file.playerSeekBackward`),"Seek forward":e(`file.playerSeekForward`),"seek back {seekOffset} seconds":e(`file.playerSeekBackSeconds`),"seek forward {seekOffset} seconds":e(`file.playerSeekForwardSeconds`),"playback time":e(`file.playerTime`),"media loading":e(`file.playerLoading`),"video player":e(`file.playerVideo`),"audio player":e(`file.playerAudio`),"{time} remaining":e(`file.playerRemaining`),"{currentTime} of {totalTime}":e(`file.playerCurrentOfTotal`),"video not loaded, unknown time.":e(`file.playerUnknownTime`),hour:e(`file.playerHour`),hours:e(`file.playerHours`),minute:e(`file.playerMinute`),minutes:e(`file.playerMinutes`),second:e(`file.playerSecond`),seconds:e(`file.playerSeconds`)}}var Ql=`[--media-primary-color:var(--foreground)] [--media-secondary-color:transparent] [--media-control-background:color-mix(in_oklch,var(--background)_88%,transparent)] [--media-control-hover-background:var(--muted)] [--media-range-bar-color:var(--primary)] [--media-range-track-background:var(--border)] [--media-range-thumb-background:var(--primary)] [--media-font-family:var(--onu-font-sans)] [--media-focus-box-shadow:inset_0_0_0_3px_var(--ring)]`;function $l({src:e,kind:t=`video`,title:r,poster:a,tracks:o=[],playbackRates:c=[.5,1,1.25,1.5,2],seekOffset:l=10,loop:u,muted:d,preload:f=`metadata`,crossOrigin:p,className:m,classNames:h,...g}){let{t:_,locale:v}=i(),y=t===`audio`;s.useMemo(()=>{pe(v.code,Zl(_)),fe(v.code)},[v.code,_]);let ee=typeof e==`string`?[{src:e}]:e,b={slot:`media`,title:r,loop:u,muted:d,preload:f,crossOrigin:p,playsInline:!0,className:n(y?`w-full`:`size-full object-contain`,h?.media)},te=(0,$.jsxs)($.Fragment,{children:[ee.map(e=>(0,$.jsx)(`source`,{src:e.src,type:e.type},e.src)),o.map(e=>(0,$.jsx)(`track`,{src:e.src,srcLang:e.srcLang,label:e.label,kind:e.kind??`captions`,default:e.default},e.src))]});return(0,$.jsxs)(zl,{audio:y||void 0,"data-slot":`media-player`,"data-kind":t,"aria-label":r,className:n(Ql,`@container block w-full overflow-hidden rounded-xl border border-border bg-card`,!y&&`aspect-video bg-foreground`,m),...g,children:[y?(0,$.jsx)(`audio`,{...b,children:te}):(0,$.jsx)(`video`,{...b,poster:a,children:te}),(0,$.jsxs)(Vl,{dir:`ltr`,className:n(`w-full`,h?.controlBar),children:[(0,$.jsx)(Gl,{className:`touch:min-w-11 touch:min-h-11`}),(0,$.jsx)(Kl,{seekOffset:l,className:`min-h-6 min-w-6 touch:min-w-11 @max-sm:hidden`}),(0,$.jsx)(ql,{seekOffset:l,className:`min-h-6 min-w-6 touch:min-w-11 @max-sm:hidden`}),(0,$.jsx)(Yl,{className:`min-w-16 flex-1`}),(0,$.jsx)(Jl,{showDuration:!0,className:`tabular-nums`}),(0,$.jsx)(Ul,{className:`min-h-6 min-w-6 touch:min-w-11`}),(0,$.jsx)(Xl,{className:`@max-sm:hidden`}),o.length?(0,$.jsx)(Bl,{className:`min-h-6 min-w-6 touch:min-w-11`}):null,(0,$.jsx)(Wl,{rates:c,className:`min-h-6 min-w-6 touch:min-w-11`}),y?null:(0,$.jsx)(Hl,{className:`min-h-6 min-w-6 touch:min-w-11`})]})]},v.code)}export{$l as t};