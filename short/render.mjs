import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve, extname } from 'node:path';
const root=process.cwd();
const srv=createServer((req,res)=>{
  const url=decodeURIComponent((req.url||'/').split('?')[0]);
  const p=url==='/three.module.js'?'node_modules/three/build/three.module.js':url==='/scene.js'?'short/scene.js':'short/index.html';
  try {const data=readFileSync(resolve(root,p));res.writeHead(200,{'Content-Type':extname(p)==='.js'?'text/javascript':'text/html'});res.end(data);}catch(e){res.writeHead(404);res.end(String(e));}
});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));
const port=srv.address().port;
mkdirSync('output',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:540,height:960},deviceScaleFactor:1});
page.on('pageerror',e=>console.error('PAGE ERROR',e));
await page.goto(`http://127.0.0.1:${port}/`);
await page.waitForFunction(()=>window.ready===true,{timeout:60000});
const proc=spawnSync('ffmpeg',['-version'],{encoding:'utf8'});if(proc.status!==0)throw Error('FFmpeg missing');
const {spawn}=await import('node:child_process');
const ff=spawn('ffmpeg',['-y','-hide_banner','-loglevel','error','-f','image2pipe','-framerate','30','-vcodec','png','-i','-','-f','lavfi','-i','anullsrc=channel_layout=stereo:sample_rate=44100','-shortest','-vf','scale=1080:1920:flags=lanczos','-c:v','libx264','-preset','veryfast','-crf','21','-pix_fmt','yuv420p','-c:a','aac','-movflags','+faststart','output/emperor-ocean-short.mp4'],{stdio:['pipe','inherit','inherit']});
let exitCode;const exited=new Promise((resolve)=>ff.on('close',c=>{exitCode=c;resolve();}));
for(let frame=0;frame<900;frame++){
 await page.evaluate(f=>window.renderFrame(f),frame);
 const png=await page.screenshot({type:'png'});
 if(!ff.stdin.write(png)) await new Promise(r=>ff.stdin.once('drain',r));
 if(frame%90===0)console.log(`Rendered ${frame}/900 frames`);
}
ff.stdin.end();await exited;await browser.close();srv.close();if(exitCode!==0)throw Error('FFmpeg failed '+exitCode);console.log('Done: output/emperor-ocean-short.mp4');
