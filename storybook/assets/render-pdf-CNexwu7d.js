import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{i as t,n,r}from"./index.es-E-M2ZMEW.js";import{n as i,t as a}from"./error-BF_bxqZK.js";import{a as o,c as s,f as c,g as l,i as u,p as d,u as f,y as p}from"./dist-C9voJuMK.js";import{n as m,r as h,t as g}from"./createServerFn-BvG-hSgf.js";import{getRequestUrl as _}from"@tanstack/react-start/server";function v(e){return(e.protocol===`http:`||e.protocol===`https:`)&&O.has(e.hostname)}function y(){if({}.BUN_CHROME_PATH||process.platform!==`darwin`)return;let e=[`/Applications`,(0,T.join)((0,w.homedir)(),`Applications`)];for(let t of A)for(let n of e){let e=(0,T.join)(n,t);if((0,C.existsSync)(e))return e}}function b(){let e=y();return{type:`chrome`,...e?{path:e}:{},url:!1,argv:process.getuid?.()===0?[`--no-sandbox`]:[]}}function x(e){return(e instanceof Error?e.message:String(e))===`timeout`?new a(`PDF の作成が時間内に終わりませんでした。「印刷 / PDF 保存」を使ってください`):new a(`PDF を作れませんでした。Google Chrome（または Chromium・Microsoft Edge・Brave）が入っているか確かめるか、「印刷 / PDF 保存」を使ってください`)}async function S(e){if(!v(e))return n(new a(`手元のサーバの画面だけを PDF にできます`));let r,i,o=new Promise((e,t)=>{i=setTimeout(()=>t(Error(`timeout`)),E)});try{let n=(async()=>(r=new Bun.WebView({backend:b(),...D}),await r.navigate(e.href),await r.evaluate(k),(await r.cdp(`Page.printToPDF`,{preferCSSPageSize:!0,printBackground:!0})).data))();return n.catch(()=>void 0),t(await Promise.race([n,o]))}catch(e){return console.error(`PDF の作成に失敗しました`,e),n(x(e))}finally{clearTimeout(i),r?.close()}}var C,w,T,E,D,O,k,A;function j(){return(j=e((()=>{C=h(),w=h(),T=h(),r(),i(),E=3e4,D={width:1280,height:1800},O=new Set([`127.0.0.1`,`localhost`,`[::1]`]),k=`(async () => {
  while (document.documentElement.dataset.pdfReady !== "true") {
    if (document.documentElement.dataset.pdfReady === "error") {
      throw new Error("シートを読めませんでした");
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  await document.fonts.ready;
  let last = -1;
  let stable = 0;
  while (stable < 5) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
    const count = document.querySelectorAll("[data-paper]").length;
    if (count > 0 && count === last) {
      stable += 1;
    } else {
      stable = 0;
      last = count;
    }
  }
  return last;
})()`,A=[`Google Chrome.app/Contents/MacOS/Google Chrome`,`Chromium.app/Contents/MacOS/Chromium`,`Microsoft Edge.app/Contents/MacOS/Microsoft Edge`,`Brave Browser.app/Contents/MacOS/Brave Browser`]})))()}var M,N;function P(){return(P=e((()=>{u(),M=`/skill-sheet/print`,N=d({year:l(c(),o(),f(1900),s(9999)),month:l(c(),o(),f(1),s(12)),day:l(c(),o(),f(1),s(31))})})))()}var F;function I(){return(I=e((()=>{m(),r(),u(),i(),j(),P(),F=g({method:`POST`,strict:!1}).validator(e=>e).handler(async e=>{let r=p(N,e.data);if(!r.success)return n(new a(r.issues[0]?.message??`入力が不正です`));let i=new URL(M,_().origin);for(let[e,t]of Object.entries(r.output))i.searchParams.set(e,String(t));let o=await S(i);return o.isOk()?t({base64:o.value}):n(o.error)})})))()}I();export{F as renderPdfFn};