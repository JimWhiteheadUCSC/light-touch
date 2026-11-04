/*@vfx
id: 1214179f-be4b-450c-ac3f-3303686752d3
title: Light on the Other Side of the Wall
created: 2026-09-30
artist: Register
lineage:
  - id: ed7397ac-2caa-4a62-8707-6a9b9ea84ef8
    relation: contrast
    note: >-
      The Hour Is Cast Sideways lets one shadow read a ruled dial. This piece
      removes the dial and pointer: architectural bars fall across a continuous
      floor, where the room's light is legible only by its passing.
influences: [verena-loewensberg, mizuki-heitaro]
rationale: |
  A window is present in a room by the light it withholds. Its unseen frame
  casts three unequal bars and one crosspiece across a blue-grey floor. Their
  bearing follows the household clock; daylight sets the reach of the light.
  Clouds soften the edges, while rain lays a slow glint on the unshadowed
  floor. Without a weather feed, the slate and amber remain a complete room.

  Against The Hour Is Cast Sideways: no dial, pointer, or numeral is offered.
  The hour turns the room through which the shadow passes. The panel is not a
  face that measures time, but the surface interrupted by time from elsewhere.
@vfx*/
const meta={name:"light_on_the_other_side_of_the_wall",fps:30,inputs:["clock","env"]};
const DX=new Float32Array(64),DY=new Float32Array(64);
for(let i=0;i<64;i++){DX[i]=i-31.5;DY[i]=i-31.5;}
function render(t,dt){
 const cl=input.clock,ev=input.env;
 const hour=clamp(cl.hour,0,24)+clamp(cl.minute,0,59)/60;
 const day=clamp(cl.daylight,0,1);
 const cloud=ev.ok?clamp(ev.cloud,0,1):0.20;
 const rain=ev.ok?clamp(ev.rain,0,1):0.08;
 const temp=ev.ok?clamp((ev.tempC-16)/20,-0.5,0.7):0;
 const a=hour*0.261799+0.205*t+0.17*Math.sin(t*0.031);
 const ca=Math.cos(a),sa=Math.sin(a);
 const softness=1.15+cloud*1.1, inv=1/(2*softness);
 const drift=4.5*Math.sin(t*0.157+0.4);
 const crossShift=3.2*Math.sin(t*0.093+1.1);
 const warm=clamp(0.58+0.24*day-0.18*cloud+0.12*temp,0.2,0.95);
 const broad=0.67+0.27*day;
 const floorR=0.80+0.20*warm, floorG=0.82+0.12*warm, floorB=1.08-0.20*warm;
 for(let y=0;y<64;y++){
  const dy=DY[y];
  let u=-31.5*ca+dy*sa;
  let v=31.5*sa+dy*ca;
  const row=y*64;
  for(let x=0;x<64;x++){
   const side=u+drift;
   let d=Math.abs(side+18.5);
   let q=Math.abs(side+4.0);if(q<d)d=q;
   q=Math.abs(side-13.5);if(q<d)d=q;
   let aa=(2.25+softness-d)*inv;aa=aa<0?0:aa>1?1:aa;aa=aa*aa*(3-2*aa);
   const cd=Math.abs(v-0.085*u-crossShift);
   let bb=(2.0+softness-cd)*inv;bb=bb<0?0:bb>1?1:bb;bb=bb*bb*(3-2*bb);
   const shade=1-(1-aa)*(1-bb*0.88);
   let light=broad*(0.85-0.15*(v+31.5)/63)*(1-shade*(0.93-cloud*0.12));
   let r=7+121*light*floorR;
   let g=10+108*light*floorG;
   let b=17+94*light*floorB;
   let halo=1-Math.abs(d-2.25)*0.48;halo=halo<0?0:halo>1?1:halo;
   halo*=0.055*(0.55+0.45*day)*(1-cloud*0.4);
   r+=76*halo;g+=42*halo;b+=14*halo;
   const wet=rain*0.055*(1-aa*0.3);
   r+=22*wet;g+=32*wet;b+=40*wet;
   r=r<0?0:r>255?255:r;g=g<0?0:g>255?255:g;b=b<0?0:b>255?255:b;
   setPixel(x,y,((r|0)<<16)|((g|0)<<8)|(b|0));
   u+=ca;v-=sa;
  }
 }
}