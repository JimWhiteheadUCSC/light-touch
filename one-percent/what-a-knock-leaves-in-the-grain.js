/*@vfx
id: 63374c7f-d864-4f9b-8add-1d7e979700d4
title: What a Knock Leaves in the Grain
created: 2026-09-30
artist: Register
lineage:
  - id: 07a4d9a4-a944-4d11-820f-603dd2e9f9ac
    relation: contrast
    note: >-
      A Membrane Learns the Room lets sound continuously rebalance the modes of one
      surface. Here sound is an event that leaves a local directional memory in
      ruled strokes, then passes. In quiet, the field makes its own patient taps.
influences: [okazz, verena-loewensberg]
rationale: |
  A knock has two lives: the wave that crosses the room, and the grain it leaves
  in whatever was struck. Here a small field of ruled strokes receives both. An
  audio beat or a button press sends a ring in from the edge; as it passes, each
  stroke turns toward the ring's tangent. Its angle keeps a little of that turn
  after the wave is gone, then slowly returns to its private ruling.

  The marks do not grow brighter with loudness. Sound is an occasion, not a meter.
  In a quiet room, the surface supplies its own occasional taps, so the afterimage
  remains a complete work without a microphone or a hand. The short, separate
  lines hold their places; what travels is the relation between their remembered
  directions and the passing wave.

  Against A Membrane Learns the Room: no continuous modal sum and no nodal picture.
  This is a field of small acts and their residue. The image is not the sound, nor
  its echo, but the slight change in the rule each mark keeps after listening.
@vfx*/
const meta={name:"what_a_knock_leaves_in_the_grain",fps:30,inputs:["audio","button"]};
const N=9,C=N*N,PI=Math.PI;
const X=new Float32Array(C),Y=new Float32Array(C),BASE=new Float32Array(C),REST=new Float32Array(C),MEM=new Float32Array(C),PH=new Float32Array(C),RR=new Float32Array(C),GG=new Float32Array(C),BB=new Float32Array(C);
const R=new Float32Array(4096),G=new Float32Array(4096),B=new Float32Array(4096);
let ex=32,ey=32,age=99,serial=0,timer=1,cool=0;
function wrap(a){while(a>PI/2)a-=PI;while(a<-PI/2)a+=PI;return a;}
for(let j=0;j<N;j++)for(let i=0;i<N;i++){
 const n=j*N+i;X[n]=4.5+i*6.9;Y[n]=4.5+j*6.9;
 BASE[n]=0.12*Math.sin(i*1.5+j*.7)+.10*Math.cos(j*1.2-i*.9);REST[n]=BASE[n];PH[n]=i*1.73+j*2.31;
 const h=[.085,.51,.91][(i*2+j*3)%3],c=hsv(h,.8,.9);
 RR[n]=(c>>16)&255;GG[n]=(c>>8)&255;BB[n]=c&255;
}
function strike(){serial++;const a=serial*2.399963;ex=31.5+Math.cos(a)*19;ey=31.5+Math.sin(a)*19;age=0;timer=5.8+Math.random()*1.8;cool=.8;
 for(let n=0;n<C;n++){const dx=X[n]-ex,dy=Y[n]-ey,d=Math.sqrt(dx*dx+dy*dy);const w=.90*Math.exp(-d*d/(2*29*29));const tangent=Math.atan2(dy,dx)+PI*.5;REST[n]+=wrap(tangent-REST[n])*w;MEM[n]=Math.min(1,MEM[n]+w*.95);}}
function splat(px,py,r,g,b,a){const ix=px|0,iy=py|0,fx=px-ix,fy=py-iy;for(let oy=0;oy<2;oy++){let yy=iy+oy;if(yy<0||yy>63)continue;for(let ox=0;ox<2;ox++){let xx=ix+ox;if(xx<0||xx>63)continue;let q=a*(ox?fx:1-fx)*(oy?fy:1-fy);let k=yy*64+xx;R[k]+=(r-R[k])*q;G[k]+=(g-G[k])*q;B[k]+=(b-B[k])*q;}}}
function render(t,dt){const s=clamp(dt,.001,.1);timer-=s;cool=Math.max(0,cool-s);if((input.button.pressed||(input.audio.ok&&input.audio.beat))&&cool<=0)strike();else if(timer<=0)strike();age+=s;
 for(let n=0;n<C;n++){REST[n]=BASE[n]+wrap(REST[n]-BASE[n])*Math.exp(-s/85);MEM[n]*=Math.exp(-s/72);}
 for(let y=0;y<64;y++){let row=y*64;for(let x=0;x<64;x++){let q=.5+.5*Math.sin(x*.075+y*.046+t*.09);R[row+x]=8+q*2.5;G[row+x]=10+q*2.5;B[row+x]=17+q*4;}}
 const rad=age*12.5,fade=Math.exp(-age/6.2);
 for(let n=0;n<C;n++){
  const dx=X[n]-ex,dy=Y[n]-ey,d=Math.sqrt(dx*dx+dy*dy);
  const wave=Math.exp(-((d-rad)*(d-rad))/92)*fade;
  const tangent=Math.atan2(dy,dx)+PI*.5;
  const theta=REST[n]+.34*Math.sin(t*.24+PH[n])+.78*wave*wrap(tangent-REST[n])+.12*wave*Math.sin(t*1.4+PH[n]);
  const len=2.45+.48*MEM[n]+.38*Math.sin(t*.14+PH[n]*.7),ca=Math.cos(theta),sa=Math.sin(theta);
  const glow=.66+.15*MEM[n]+.18*wave;
  const rr=RR[n]*glow,gg=GG[n]*glow,bb=BB[n]*glow;
  for(let z=0;z<=8;z++){let u=z/8;splat(X[n]-ca*len+2*ca*len*u,Y[n]-sa*len+2*sa*len*u,rr,gg,bb,.94);}
 }
 for(let i=0;i<4096;i++)setPixel(i&63,i>>6,((R[i]|0)<<16)|((G[i]|0)<<8)|(B[i]|0));
}
