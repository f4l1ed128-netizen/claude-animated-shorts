import * as THREE from '/three.module.js';
const W=540,H=960;
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(W,H);renderer.setPixelRatio(1);renderer.shadowMap.enabled=true;renderer.setClearColor('#91cbed');document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color('#91cbed');scene.fog=new THREE.Fog('#91cbed',17,48);
const camera=new THREE.PerspectiveCamera(48,W/H,.1,100);
scene.add(new THREE.HemisphereLight('#fff5db','#526e99',2.1));const sun=new THREE.DirectionalLight('#fff1b5',3.4);sun.position.set(-7,13,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-20;sun.shadow.camera.right=20;sun.shadow.camera.top=20;sun.shadow.camera.bottom=-20;scene.add(sun);
function mat(c){return new THREE.MeshStandardMaterial({color:c,roughness:.88,flatShading:true});}
function box(w,h,d,color,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;}
function sphere(r,color,x,y,z){const o=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),mat(color));o.position.set(x,y,z);o.castShadow=true;scene.add(o);return o;}
function cylinder(a,b,h,color,x,y,z){const o=new THREE.Mesh(new THREE.CylinderGeometry(a,b,h,9),mat(color));o.position.set(x,y,z);o.castShadow=true;scene.add(o);return o;}
const ground=box(80,.5,50,'#e9c486',0,-.5,-5);ground.receiveShadow=true;
const sea=box(80,.12,26,'#238db0',0,-.18,-23);const waves=[];for(let i=0;i<18;i++){const o=box(3.4,.025,.09,'#b9f0e5',-16+(i%6)*6,.0,-12-Math.floor(i/6)*5);waves.push(o);}
for(let i=0;i<30;i++){const x=((i*17)%37)-18,z=-32-(i*13)%13;sphere(1.5+(i%4)*.45,i%2?'#719b9c':'#648fa4',x,.8,z);}
// Roman stone columns and standard on land
for(let i=0;i<3;i++){let x=-9+i*6; cylinder(.23,.32,4.3,'#e7d4a9',x,2,-5);box(.9,.28,.9,'#f2d9ac',x,4.2,-5);}
cylinder(.07,.07,5,'#624334',-5.8,2.4,-3.5);const flag=box(1.8,1.3,.08,'#b94148',-4.9,3.7,-3.5);
const shellMeshes=[];for(let i=0;i<22;i++){const x=-7+(i*23%15),z=-1+(i*7%11);const s=sphere(.11+(i%3)*.03,i%2?'#fce1ba':'#edb8a0',x,.08,z);shellMeshes.push(s);}
// Characters: hand-drawn 2D art as sprites, physically placed in the 3D world.
function toon(emperor=false,face='smile'){
 const c=document.createElement('canvas');c.width=256;c.height=430;const q=c.getContext('2d');q.lineCap='round';q.lineJoin='round';
 const stroke=(pts,w=8,col='#2c273b')=>{q.beginPath();pts.forEach(([x,y],i)=>i?q.lineTo(x,y):q.moveTo(x,y));q.strokeStyle=col;q.lineWidth=w;q.stroke();};
 // boots, legs
 stroke([[103,302],[94,403],[74,411]],10);stroke([[151,302],[161,404],[179,411]],10);
 // red cloak and body
 q.fillStyle=emperor?'#8b4bb2':'#c84d46';q.beginPath();q.moveTo(84,204);q.lineTo(173,204);q.lineTo(193,332);q.lineTo(64,332);q.closePath();q.fill();q.strokeStyle='#29253a';q.lineWidth=8;q.stroke();
 q.fillStyle=emperor?'#edc95d':'#a8b7bb';q.fillRect(96,213,63,110);q.strokeRect(96,213,63,110);
 stroke([[92,224],[47,267],[38,250]],10);stroke([[164,224],[209,265],[220,248]],10);
 q.fillStyle='#fff8ec';q.beginPath();q.ellipse(127,135,69,81,0,0,Math.PI*2);q.fill();q.lineWidth=9;q.stroke();
 q.fillStyle='#29253a';q.beginPath();q.ellipse(105,135,6,9,0,0,7);q.ellipse(151,135,6,9,0,0,7);q.fill();
 q.beginPath();if(face==='shock'){q.ellipse(128,171,9,14,0,0,7)}else{q.arc(128,157,18,0,Math.PI)}q.lineWidth=6;q.stroke();
 if(emperor){q.fillStyle='#e8b94f';q.beginPath();q.arc(127,110,73,Math.PI*1.05,Math.PI*1.95);q.lineWidth=16;q.strokeStyle='#e8b94f';q.stroke();for(let x=80;x<180;x+=24){q.beginPath();q.arc(x,62,10,0,7);q.fill();}}
 else{q.fillStyle='#8a9eae';q.beginPath();q.arc(127,118,73,Math.PI,2*Math.PI);q.lineTo(199,118);q.lineTo(55,118);q.closePath();q.fill();q.lineWidth=8;q.strokeStyle='#29253a';q.stroke();q.fillStyle='#bd4144';q.fillRect(119,30,18,24);}
 const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false}));sp.scale.set(2.6,4.4,1);sp.center.set(.5,0);scene.add(sp);return sp;
}
const emperor=toon(true),soldiers=[toon(false,'shock'),toon(false),toon(false,'shock'),toon(false)];
// Screen overlay captions (not voice captions): short story beat titles
const overlay=document.createElement('canvas');overlay.width=W;overlay.height=H;overlay.style.position='absolute';overlay.style.left='0';overlay.style.top='0';overlay.style.pointerEvents='none';document.body.appendChild(overlay);const ctx=overlay.getContext('2d');
const titles=[['AN EMPEROR DECLARED WAR...',0],['...ON THE OCEAN.',4],['ROME, 40 AD',8],['THE SOLDIERS PREPARED',12],['THEN CAME THE ORDER...',16],['COLLECT SEASHELLS?!',20],['THE EMPEROR CELEBRATED',24],['THE OCEAN DID NOT CARE.',27]];
function smooth(a,b,t){const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);}
window.renderFrame=(frame)=>{
 const t=frame/30;
 waves.forEach((w,i)=>{w.position.x=-16+(i%6)*6+Math.sin(t*1.4+i)*.9;w.position.y=.02+Math.sin(t*2+i)*.045;});
 flag.rotation.y=Math.sin(t*2)*.16;
 // animated blocking: march, assemble, seashell collection, final reaction
 const march=smooth(3,9,t),collect=smooth(19,23,t);
 emperor.position.set(2.7-march*.8,0,1.3);emperor.material.rotation=Math.sin(t*2.2)*.03;
 soldiers.forEach((s,i)=>{let x=-3.8+i*1.45+march*.5;let z=2.2+(i%2)*.9;let bob=t<12?Math.abs(Math.sin(t*7+i))*0.13:Math.sin(t*2+i)*.025;s.position.set(x,bob-(collect*(i%2===0?.75:.22)),z);s.material.rotation=(collect&&i%2===0)?-.16:Math.sin(t*2+i)*.018;});
 // smooth camera progression with closeups and a pullback
 let target=new THREE.Vector3(0,1.4,0),pos=new THREE.Vector3(0,4.3,13);
 if(t<5){pos.set(1.6,3.7,11.4-t*.2);target.set(0,1.8,0)}
 else if(t<11){pos.set(-2+smooth(5,11,t)*2,4,11);target.set(-.6,1.7,0)}
 else if(t<17){pos.set(0,3.7,10-smooth(11,17,t)*2.4);target.set(.7,1.7,0)}
 else if(t<24){pos.set(-1.7,3.2,8.4);target.set(-1.2,1.1,0)}
 else{pos.set(0,4.4,11+smooth(24,30,t)*2);target.set(0,1.5,-1)}
 camera.position.copy(pos);camera.lookAt(target);
 renderer.render(scene,camera);
 ctx.clearRect(0,0,W,H);
 let title=titles[0][0];for(const [s,start] of titles)if(t>=start)title=s;
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 26px Arial';const width=ctx.measureText(title).width;ctx.fillStyle='rgba(31,28,49,.88)';ctx.beginPath();ctx.roundRect(W/2-width/2-19,72,width+38,58,14);ctx.fill();ctx.fillStyle='#fff4dd';ctx.fillText(title,W/2,101);
 // subtle progress line
 ctx.fillStyle='rgba(255,255,255,.65)';ctx.fillRect(32,H-42,(W-64)*(t/30),3);
};
window.renderFrame(0);window.ready=true;
