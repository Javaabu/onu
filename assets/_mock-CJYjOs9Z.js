function e(e,t,n=1200,r=800){let i=`<svg xmlns="http://www.w3.org/2000/svg" width="${n}" height="${r}" viewBox="0 0 ${n} ${r}">
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
  <text x="${n/2}" y="${r*.93}" font-family="sans-serif" font-size="${r*.06}" text-anchor="middle" fill="hsl(200 40% 20%)">${e}</text>
</svg>`;return`data:image/svg+xml;charset=utf-8,${encodeURIComponent(i)}`}var t=[{src:e(`Maafushi`,200),alt:`Maafushi beach at noon`,title:`Maafushi`,description:`Kaafu Atoll`},{src:e(`Fuvahmulah`,15,900,1200),alt:`Sunset over Fuvahmulah`,title:`Fuvahmulah`,description:`Gnaviyani Atoll`},{src:e(`Hulhumalé`,210),alt:`Hulhumalé skyline from the beach`,title:`ހުޅުމާލެ`,description:`Phase 2`},{src:e(`Addu`,170,1200,900),alt:`Addu City causeway`,title:`Addu City`,description:`Seenu Atoll`},{src:e(`Baa Atoll`,185,800,1100),alt:`Hanifaru Bay lagoon`,title:`Hanifaru Bay`,description:`UNESCO biosphere reserve`},{src:e(`Thoddoo`,120),alt:`Thoddoo farmland and beach`,title:`Thoddoo`,description:`Alif Alif Atoll`}],n=(e,{onProgress:t,signal:n})=>new Promise((r,i)=>{let a=0,o=setInterval(()=>{a=Math.min(100,a+8+Math.round(Math.random()*14)),t(a),a>=100&&(clearInterval(o),/fail/i.test(e.name)?i(Error(`The file could not be scanned. Please try another file.`)):r({data:{id:Math.round(Math.random()*1e4),name:e.name}}))},250);n.addEventListener(`abort`,()=>{clearInterval(o),i(new DOMException(`Aborted`,`AbortError`))})});export{t as n,e as r,n as t};