const scanvas=document.getElementById("scanvas")
const stx=scanvas.getContext("2d")
const canvas=document.getElementById("canvas")
const ctx=canvas.getContext("2d")
let sprite=null
let tilesize=-1
const fileinput=document.getElementById("fileinput")
let processing=false
const tileset=`
003003300630013004300730223025302830
303133313631313134315531473152315831
603263326632613264326732823285328832
000301030203030304030503660367036803
101311131213131314131513761377137813
202321232223232324232523862387238823
003301332233033314332533663367338833

004001400240034004400540064007409840
205021502250235024502550a65027502850
60416141b241634164416541664167416841
c05181518251835184518551865187518851

204201420242234204420542a642a7429842
c052c1528252835284528552a652a7522852
60438143b243634364436543064307439843
c053c153b253835364536553865367536853

2062016202622362046205622662a7629862
807281728272837284728572a67227722872
60636163b263636364636563066307630863
c073c173c273837384736573867367736873

208021800280238024800580a68007800880
c090c1908290839084908590469047902890
608161816281638164816581068107819881
80918191b291839184916591869187916891

408241824282438244824582a68247829882
c09241924292439244924592a69247924892
40834183b283438344834583468347839883
c0934193b293439344934593469347934893

c0a041a0b2a043a044a045a0a6a047a098a0
c0a141a142a143a144a145a146a147a198a1
40a241a2b2a243a244a245a2a6a247a248a2

40b041b0b2b043b044b045b0a6b047b098b0
c0b141b142b143b144b145b1a6b147b198b1
c0b241b2b2b243b244b245b2a6b247b248b2
c0b341b3b2b343b344b345b346b347b398b3
`
function setcout(stri){
  document.getElementById("cout").innerHTML=stri
}
function pause(ms) {
  return new Promise(resolve=>setTimeout(resolve,ms))
}
function drawSprite(){
  stx.putImageData(sprite,0,0)
}

async function rotclone(sx,sy,w,h,ex,ey,deg){
  ctx.fillStyle="red"
  ctx.fillRect(sx,sy,w,h)
  ctx.fillStyle="blue"
  ctx.fillRect(ex,ey,w,h)
  for(let x=sx;x<sx+w;x++){
    await pause(1)
    for(let y=sy;y<sy+h;y++){
      const px=stx.getImageData(x,y,1,1)
      ctx.putImageData(px,ex+w-x+sx-1,ey+h-y+sy-1)
      ctx.putImageData(px,x,y)
    }
  }
}
function cloneThird(t,c,x,y){
  drawSprite()
  let ox=0,oy=0,cx=0,cy=0
  t=parseInt(t,16)
  x=parseInt(x,16)
  if(t<=8){
    ox=t%3
    oy=Math.floor(t/3)
  }else{
    ox=(t+1)%2+3
    oy=Math.floor((t-9)/2)
  }
  
  cx=c%3+1
  cy=Math.floor(c/3)+1
  ctx.putImageData(stx.getImageData(Math.floor(ox*tilesize+tilesize/3*(cx-1)),Math.floor(oy*tilesize+tilesize/3*(cy-1)),Math.ceil(tilesize/3),Math.ceil(tilesize/3)),Math.floor(x*tilesize+tilesize/3*(cx-1)),Math.floor(y*tilesize+tilesize/3*(cy-1)))
  stx.strokeStyle="red"
  stx.lineWidth=2
  stx.strokeRect(Math.floor(ox*tilesize+tilesize/3*(cx-1)),Math.floor(oy*tilesize+tilesize/3*(cy-1)),Math.ceil(tilesize/3),Math.ceil(tilesize/3))
}
async function autotile(){
  if(processing||tilesize<=0){
    setcout("no")
    return
  }
  processing=true
  ctx.fillStyle="black"
  ctx.fillRect(0,0,canvas.width,canvas.height)
  
  ctx.putImageData(stx.getImageData(0,0,tilesize*3,tilesize*3),0,0)
  ctx.putImageData(stx.getImageData(tilesize*3,0,tilesize*2,tilesize*2),tilesize*6,0)
  tsplit=tileset.match(/.{1,4}/g)
  let i=0
  while(true){
    const inst=tsplit[i]
    if(!inst||i>1000){
      break
    }
    cloneThird(inst[0],inst[1],inst[2],inst[3])
    setcout("generating..."+Math.min(100,Math.floor(i/(33*9)*1000)/10)+"%")
    i++
    await pause(1)
  }
  drawSprite()
  processing=false
}

function render(){
  requestAnimationFrame(render)
}
render()

async function getWidth(){
  let keep=true
  let i=0
  const imgd=stx.getImageData(0,0,scanvas.width,scanvas.height)
  while(true){
    keep=false
    if(i>320){
      return -1
    }
    for(let y=0;y<64;y++){
      px=stx.getImageData(i,y,1,1).data
      if(px[0]+px[1]+px[2]>=0.01){
        keep=true
      }
    }
    if(!keep){
      return i
    }
    stx.fillStyle="red"
    stx.fillRect(i,0,1,scanvas.height)
    if(i%2==0)await pause(1)
    stx.putImageData(imgd,0,0)
    i++
  }
}

fileinput.addEventListener("change", async function(event) {
  if(processing){
    return
  }
  processing=true
  let ter=false
  scanvas.height=64*3
  scanvas.width=64*5
  const file = event.target.files[0]
  const reader=new FileReader()
  reader.onload=async function(e){
    const img=new Image()
    img.onload=function(){
      stx.drawImage(img,0,0)
    }
    img.src=e.target.result
  }
  reader.readAsDataURL(file)
  let w=0
  while(true){
    for(let i=0;i<=10;i++){
      setcout("please wait..."+Math.floor(i/10*1000)/10+"%")
      await pause(1)
    }
    setcout("scanning...")
    if(await getWidth()>0){
      break
    }
    w++
    if(w>120){
      setcout("ERROR")
      ter=true
      break
    }
  }
  if(ter){
    processing=false
    return
  }
  const width=await getWidth()
  tilesize=width/5
  sprite=stx.getImageData(0,0,tilesize*5,tilesize*3)
  scanvas.width=tilesize*5
  scanvas.height=tilesize*3
  drawSprite()
  setcout("success: click generate to start generating")
  processing=false
})

dbtn.addEventListener("click",()=>{
  const link=document.createElement("a")
  link.download="tilegen47.png"
  link.href=canvas.toDataURL("image/png")
  link.click()
})