import{c as e}from"./button-DRXR2maZ.js";import{n as t}from"./routes-CK3ic40U.js";function n(){let e=t();return t=>e?t.dv:t.en}function r(){let e=t();return t=>`${e?`ރ.`:`MVR`} ${t.toLocaleString(`en-US`,{minimumFractionDigits:2,maximumFractionDigits:2})}`}function i(e,t,n=1200,r=800){let i=`<svg xmlns="http://www.w3.org/2000/svg" width="${n}" height="${r}" viewBox="0 0 ${n} ${r}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="hsl(${t} 70% 72%)"/>
      <stop offset="1" stop-color="hsl(${t+30} 80% 88%)"/>
    </linearGradient>
  </defs>
  <rect width="${n}" height="${r}" fill="url(#sky)"/>
  <circle cx="${n*.75}" cy="${r*.3}" r="${r*.1}" fill="hsl(45 100% 70%)"/>
  <path d="M0 ${r*.68} Q ${n*.25} ${r*.6} ${n*.5} ${r*.68} T ${n} ${r*.66} V ${r} H 0 Z" fill="hsl(190 70% 45%)"/>
  <path d="M0 ${r*.8} Q ${n*.3} ${r*.74} ${n*.6} ${r*.8} T ${n} ${r*.78} V ${r} H 0 Z" fill="hsl(45 60% 82%)"/>
  ${e?`<text x="${n/2}" y="${r*.93}" font-family="sans-serif" font-size="${r*.06}" text-anchor="middle" fill="hsl(200 40% 20%)">${e}</text>`:``}
</svg>`;return`data:image/svg+xml;charset=utf-8,${encodeURIComponent(i)}`}var a=e=>new Promise(t=>setTimeout(t,e));function o(e){return e instanceof Date?e:new Date(/^\d{4}-\d{2}-\d{2}$/.test(e)?`${e}T00:00`:e)}function s(){let{locale:t}=e(),n=t.dateFns?.localize,r=e=>String(e).padStart(2,`0`),i=(e,t=`wide`)=>n?n.month(e.getMonth(),{width:t}):e.toLocaleDateString(`en`,{month:t===`wide`?`long`:`short`}),a=e=>n?n.day(e.getDay(),{width:`wide`}):e.toLocaleDateString(`en`,{weekday:`long`}),s=e=>{let t=o(e);return`${r(t.getHours())}:${r(t.getMinutes())}`},c=(e,t=`wide`)=>{let n=o(e);return`${n.getDate()} ${i(n,t)} ${n.getFullYear()}`};return{month:i,weekday:a,time:s,date:c,dateTime:e=>`${c(e,`abbreviated`)}, ${s(e)}`,day:e=>o(e).getDate(),monthShort:e=>i(o(e),`abbreviated`)}}export{r as a,n as i,o as n,a as o,s as r,i as t};