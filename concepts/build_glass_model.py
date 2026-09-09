#!/usr/bin/env python3
"""Build the Neighbour glass mark as a self-contained binary glTF model."""
import json, math, struct
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "models" / "neighbour-glass-rainbow-v5.glb"

def rounded_rect(w, d, r, segments=4):
    pts=[]
    for cx,cz,start in [(w/2-r,d/2-r,0),( -w/2+r,d/2-r,90),(-w/2+r,-d/2+r,180),(w/2-r,-d/2+r,270)]:
        for i in range(segments+1):
            a=math.radians(start+i*90/segments)
            pts.append((cx+r*math.cos(a),cz+r*math.sin(a)))
    return pts

def arch_path(cx, cy=.42, radius=1.62, bottom=-2.08, arc_steps=52, leg_steps=16):
    p=[]
    for i in range(leg_steps):
        t=i/(leg_steps-1); p.append((cx-radius,bottom+(cy-bottom)*t))
    for i in range(1,arc_steps):
        a=math.pi-i*math.pi/(arc_steps-1); p.append((cx+radius*math.cos(a),cy+radius*math.sin(a)))
    for i in range(1,leg_steps):
        t=i/(leg_steps-1); p.append((cx+radius,cy+(bottom-cy)*t))
    return p

def sweep(path, width=.63, depth=.58, bevel=.105):
    section=rounded_rect(width,depth,bevel,5); ns=len(section)
    pos=[]
    for i,(x,y) in enumerate(path):
        if i==0: tx,ty=path[1][0]-x,path[1][1]-y
        elif i==len(path)-1: tx,ty=x-path[i-1][0],y-path[i-1][1]
        else: tx,ty=path[i+1][0]-path[i-1][0],path[i+1][1]-path[i-1][1]
        L=math.hypot(tx,ty); nx,ny=-ty/L,tx/L
        for u,z in section: pos.append((x+nx*u,y+ny*u,z))
    ind=[]
    for i in range(len(path)-1):
        for j in range(ns):
            a=i*ns+j; b=i*ns+(j+1)%ns; c=(i+1)*ns+(j+1)%ns; d=(i+1)*ns+j
            ind += [a,b,c,a,c,d]
    for j in range(1,ns-1): ind += [0,j+1,j]
    e=(len(path)-1)*ns
    for j in range(1,ns-1): ind += [e,e+j,e+j+1]
    return pos, ind

def sweep_hollow(path, width=.86, depth=.58, bevel=.105, wall=.075):
    """Rounded rectangular glass tube with a continuous open inner channel."""
    outer=rounded_rect(width,depth,bevel,5)
    inner=rounded_rect(width-2*wall,depth-2*wall,max(.025,bevel-wall),5)
    ns=len(outer); pos=[]
    for i,(x,y) in enumerate(path):
        if i==0: tx,ty=path[1][0]-x,path[1][1]-y
        elif i==len(path)-1: tx,ty=x-path[i-1][0],y-path[i-1][1]
        else: tx,ty=path[i+1][0]-path[i-1][0],path[i+1][1]-path[i-1][1]
        L=math.hypot(tx,ty); nx,ny=-ty/L,tx/L
        for section in (outer,inner):
            for u,z in section: pos.append((x+nx*u,y+ny*u,z))
    stride=ns*2; ind=[]
    for i in range(len(path)-1):
        a0=i*stride; b0=(i+1)*stride
        for j in range(ns):
            k=(j+1)%ns
            # Outer skin.
            ind += [a0+j,a0+k,b0+k,a0+j,b0+k,b0+j]
            # Inner skin, reverse winding so the cavity renders correctly.
            ind += [a0+ns+j,b0+ns+k,a0+ns+k,a0+ns+j,b0+ns+j,b0+ns+k]
    # Annular glass rims at both open ends.
    for base,rev in ((0,False),((len(path)-1)*stride,True)):
        for j in range(ns):
            k=(j+1)%ns
            quad=[base+j,base+ns+j,base+ns+k,base+j,base+ns+k,base+k]
            ind += (list(reversed(quad)) if rev else quad)
    return pos,ind

def capsule(cx, cy, h=.72, radius=.31, depth=.62, rings=40):
    path=[]
    straight=h/2-radius
    for i in range(rings//2+1):
        a=math.pi-i*math.pi/(rings//2); path.append((cx+radius*math.cos(a),cy+straight+radius*math.sin(a)))
    for i in range(1,rings//2+1):
        a=-i*math.pi/(rings//2); path.append((cx+radius*math.cos(a),cy-straight+radius*math.sin(a)))
    return extrude_polygon(path,depth,.055)

def sphere(cx,cy,cz,r,lat=28,lon=48):
    p=[]; ind=[]
    for i in range(lat+1):
        v=i/lat; ph=math.pi*v
        for j in range(lon+1):
            th=2*math.pi*j/lon; s=math.sin(ph)
            p.append((cx+r*s*math.cos(th),cy+r*math.cos(ph),cz+r*s*math.sin(th)))
    for i in range(lat):
        for j in range(lon):
            a=i*(lon+1)+j; b=a+1; c=a+lon+2; d=a+lon+1
            ind += [a,d,b,b,d,c]
    return p,ind

def extrude_polygon(poly,depth,bevel=0):
    # Convex capsule polygon: front/back fans plus side wall.
    n=len(poly); p=[(x,y,-depth/2) for x,y in poly]+[(x,y,depth/2) for x,y in poly]
    ind=[]
    for i in range(1,n-1): ind += [0,i+1,i,n,n+i,n+i+1]
    for i in range(n):
        j=(i+1)%n; ind += [i,j,n+j,i,n+j,n+i]
    return p,ind

def normals(pos,ind):
    n=[[0.,0.,0.] for _ in pos]
    for k in range(0,len(ind),3):
        ia,ib,ic=ind[k:k+3]; a,b,c=pos[ia],pos[ib],pos[ic]
        u=[b[q]-a[q] for q in range(3)]; v=[c[q]-a[q] for q in range(3)]
        f=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
        for ix in (ia,ib,ic):
            for q in range(3): n[ix][q]+=f[q]
    out=[]
    for x,y,z in n:
        L=math.sqrt(x*x+y*y+z*z) or 1; out.append((x/L,y/L,z/L))
    return out

mint_pos,mint_ind=sweep_hollow(arch_path(-.86))
violet_pos,violet_ind=sweep_hollow(arch_path(.86))
# Both arches share the exact same depth plane, matching the flat source mark.
mint_pos=[(x,y,z) for x,y,z in mint_pos]
violet_pos=[(x,y,z) for x,y,z in violet_pos]
meshes=[
    ("Mint connected hollow glass arch",mint_pos,mint_ind,0),
    ("Violet connected hollow glass arch",violet_pos,violet_ind,1),
    ("Amber glass dot",*sphere(.01,-2.58,.03,.28),2),
]

blob=bytearray(); views=[]; accessors=[]; gltf_meshes=[]
def align():
    while len(blob)%4: blob.append(0)
def add_accessor(values,component_type,kind,target):
    align(); start=len(blob)
    flat=[v for row in values for v in (row if isinstance(row,(tuple,list)) else [row])]
    fmt='f' if component_type==5126 else 'I'
    blob.extend(struct.pack('<'+fmt*len(flat),*flat)); align()
    views.append({"buffer":0,"byteOffset":start,"byteLength":len(blob)-start,"target":target})
    item={"bufferView":len(views)-1,"componentType":component_type,"count":len(values),"type":kind}
    if kind=='VEC3':
        item['min']=[min(v[i] for v in values) for i in range(3)]; item['max']=[max(v[i] for v in values) for i in range(3)]
    accessors.append(item); return len(accessors)-1

for name,pos,ind,mat in meshes:
    nor=normals(pos,ind)
    pa=add_accessor(pos,5126,'VEC3',34962); na=add_accessor(nor,5126,'VEC3',34962); ia=add_accessor(ind,5125,'SCALAR',34963)
    gltf_meshes.append({"name":name,"primitives":[{"attributes":{"POSITION":pa,"NORMAL":na},"indices":ia,"material":mat}]})

materials=[]
for name,color,atten,disp in [
    ("Mint optical glass",[.88,1.0,.97,.42],[.58,.96,.83],.035),
    ("Violet optical glass",[.91,.91,1.0,.42],[.72,.75,1.0],.042),
    ("Amber optical glass",[1.0,.82,.48,.52],[1.0,.65,.25],.028)]:
    materials.append({"name":name,"doubleSided":True,"alphaMode":"BLEND",
      "pbrMetallicRoughness":{"baseColorFactor":color,"metallicFactor":0,"roughnessFactor":.025},
      "extensions":{"KHR_materials_transmission":{"transmissionFactor":1.0},"KHR_materials_ior":{"ior":1.48},
      "KHR_materials_volume":{"thicknessFactor":.075,"attenuationDistance":9.0,"attenuationColor":atten},
      "KHR_materials_dispersion":{"dispersion":disp}},
      "extras":{"renderingHint":"Use an HDR environment and enable refraction/transmission for rainbow glass."}})

gltf={"asset":{"version":"2.0","generator":"Neighbour glass model builder"},
 "extensionsUsed":["KHR_materials_transmission","KHR_materials_ior","KHR_materials_volume","KHR_materials_dispersion"],
 "scene":0,"scenes":[{"name":"Neighbour glass rainbow mark","nodes":list(range(len(meshes)))}],
 "nodes":[{"name":m[0],"mesh":i} for i,m in enumerate(meshes)],"meshes":gltf_meshes,"materials":materials,
 "accessors":accessors,"bufferViews":views,"buffers":[{"byteLength":len(blob)}]}
js=json.dumps(gltf,separators=(',',':')).encode(); js+=b' ' *((4-len(js)%4)%4)
blob+=b'\0' *((4-len(blob)%4)%4)
total=12+8+len(js)+8+len(blob)
OUT.parent.mkdir(parents=True,exist_ok=True)
OUT.write_bytes(struct.pack('<4sII',b'glTF',2,total)+struct.pack('<I4s',len(js),b'JSON')+js+struct.pack('<I4s',len(blob),b'BIN\0')+blob)
print(OUT)
