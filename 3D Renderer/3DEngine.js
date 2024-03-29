var bDebug;

function vec3d(x, y, z, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
}
function Vec_Add(v1, v2) {
    return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z, w: 1 };
}
function Vec_Sub(v1, v2) {
    return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z, w: 1 };
}
function Vec_Mul(v, s) {
    return { x: v.x * s, y: v.y * s, z: v.z * s, w: 1 };
}
function Vec_Div(v, s) {
    return { x: v.x / s, y: v.y / s, z: v.z / s, w: 1 };
}
function Vec_Dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}
function Vec_Cross(v1, v2) {
    return {
        x: v1.y * v2.z - v1.z * v2.y,
        y: v1.z * v2.x - v1.x * v2.z,
        z: v1.x * v2.y - v1.y * v2.x,
        w: 1
    };
}
function Vec_Length(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}
function Vec_Norm(v) {
    let l = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    return { x: v.x / l, y: v.y / l, z: v.z / l, w: 1 };
}
/**
 * 
 * @param {vec3d} i - Vector
 * @param {mat4x4} m - Matrix
 */
function Matrix_Mul_Vector(i, m) {
    let v = new vec3d();
    v.x = i.x * m.m[0][0] + i.y * m.m[1][0] + i.z * m.m[2][0] + i.w * m.m[3][0];
    v.y = i.x * m.m[0][1] + i.y * m.m[1][1] + i.z * m.m[2][1] + i.w * m.m[3][1];
    v.z = i.x * m.m[0][2] + i.y * m.m[1][2] + i.z * m.m[2][2] + i.w * m.m[3][2];
    v.w = i.x * m.m[0][3] + i.y * m.m[1][3] + i.z * m.m[2][3] + i.w * m.m[3][3];
    return { x: v.x, y: v.y, z: v.z, w: v.w };
}
function Vec_IntersectPlane(plane_p, plane_n, lineStart, lineEnd) {
    // plane_n = Vec_Norm(plane_n);
    let plane_d = -Vec_Dot(plane_n, plane_p);
    let ad = Vec_Dot(lineStart, plane_n);
    let bd = Vec_Dot(lineEnd, plane_n);
    let t = (-plane_d - ad) / (bd - ad);
    let lineStartToEnd = Vec_Sub(lineEnd, lineStart);
    let lineToIntersect = Vec_Mul(lineStartToEnd, t);

    return Vec_Add(lineStart, lineToIntersect);
}
function Triangle_ClipAgainstPlane(plane_p, plane_n, in_tri, out_tri) {
    plane_n = Vec_Norm(plane_n);

    let dist = function (p) {
        return (plane_n.x * p.x + plane_n.y * p.y + plane_n.z * p.z - Vec_Dot(plane_n, plane_p));
    };
    let inside_points = [];
    let outside_points = [];
    let nInsidePointCount = 0;

    let d0 = dist(in_tri.p[0]);
    let d1 = dist(in_tri.p[1]);
    let d2 = dist(in_tri.p[2]);

    if (d0 >= 0)
        inside_points[nInsidePointCount++] = in_tri.p[0];
    else
        outside_points.push(in_tri.p[0]);
    if (d1 >= 0)
        inside_points[nInsidePointCount++] = in_tri.p[1];
    else
        outside_points.push(in_tri.p[1]);
    if (d2 >= 0)
        inside_points[nInsidePointCount++] = in_tri.p[2];
    else
        outside_points.push(in_tri.p[2]);

    switch (nInsidePointCount) {
        case 0:
            return 0;
        case 3:
            out_tri[0] = in_tri;
            return 1;
        case 1:
            out_tri[0].col = bDebug ? '#0C2' : in_tri.col;

            out_tri[0].p[0] = inside_points[0];
            out_tri[0].p[1] = Vec_IntersectPlane(plane_p, plane_n, inside_points[0], outside_points[0]);
            out_tri[0].p[2] = Vec_IntersectPlane(plane_p, plane_n, inside_points[0], outside_points[1]);

            return 1;
        case 2:
            out_tri[0].col = bDebug ? '#C00' : in_tri.col;
            out_tri[0].p[0] = inside_points[0];
            out_tri[0].p[1] = inside_points[1];
            out_tri[0].p[2] = Vec_IntersectPlane(plane_p, plane_n, inside_points[0], outside_points[0]);


            out_tri[1].col = bDebug ? '#07F' : in_tri.col;
            out_tri[1].p[0] = inside_points[1];
            out_tri[1].p[1] = out_tri[0].p[2];
            out_tri[1].p[2] = Vec_IntersectPlane(plane_p, plane_n, inside_points[1], outside_points[0]);

            return 2;
    }
}

function triangle(p1 = 0, p2 = 0, p3 = 0) {
    //vec3d array
    this.p = [p1, p2, p3];
    this.col = "";
}
function mesh() {
    //triangle array
    this.tris;
    this.worldMatrix = new mat4x4();
    this.loadObjectFile = (objFile) => {
        let f = objFile.split('\n');
        let verts = [];
        let triangleArray = [];
        f.forEach(function (v) {
            let s = v.split(' ');
            switch (s[0]) {
                case 'v':
                    verts.push(new vec3d(s[1], s[2], s[3]));
                    break;
                case 'f':
                    triangleArray.push(new triangle(verts[s[1] - 1], verts[s[2] - 1], verts[s[3] - 1]));
                    break;
            }
        });
        this.tris = triangleArray;
    }
}
loadObjectFile = (objFile, pos) => {
    let f = objFile.split('\n');
    let verts = [];
    let triangleArray = [];
    f.forEach(function (v) {
        let s = v.split(' ');
        switch (s[0]) {
            case 'v':
                verts.push(new vec3d(s[1], s[2], s[3]));
                break;
            case 'f':
                triangleArray.push(new triangle(verts[s[1] - 1], verts[s[2] - 1], verts[s[3] - 1]));
                break;
        }
    });
    let shape = new mesh();
    shape.tris = triangleArray;
    shape.worldMatrix = Matrix_Trans(pos.x, pos.y, pos.z);
    return shape;
}
function meshPyramid() {
    let mMesh = new mesh();
    mMesh.tris = [
        //SOUTH
        new triangle(new vec3d(0.5, 1, 0.5), new vec3d(1, 0, 0), new vec3d(0, 0, 0)),
        //WEST
        new triangle(new vec3d(0, 0, 0), new vec3d(0, 0, 1), new vec3d(0.5, 1, 0.5)),
        //NORTH
        new triangle(new vec3d(0.5, 1, 0.5), new vec3d(0, 0, 1), new vec3d(1, 0, 1)),
        //EAST
        new triangle(new vec3d(1, 0, 1), new vec3d(1, 0, 0), new vec3d(0.5, 1, 0.5)),
        //BOTTOM
        new triangle(new vec3d(1, 0, 0), new vec3d(0, 0, 1), new vec3d(0, 0, 0)),
        new triangle(new vec3d(1, 0, 0), new vec3d(1, 0, 1), new vec3d(0, 0, 1))
    ];
    return mMesh;
}
function createPlain(width, length) {
    let plain = new mesh();
    plain.tris = [
        new triangle(new vec3d(0, 0, 0), new vec3d(0, 0, length), new vec3d(width, 0, 0)),
        new triangle(new vec3d(width, 0, 0), new vec3d(0, 0, length), new vec3d(width, 0, length))
    ];
    return plain;
}
function mat4x4() {
    this.m = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
}
/**
 * @param {float} fAngleRad - Radians
 */
function Matrix_RotX(fAngleRad) {
    let matrix = new mat4x4();
    matrix.m[0][0] = 1.0;
    matrix.m[1][1] = Math.cos(fAngleRad);
    matrix.m[1][2] = Math.sin(fAngleRad);
    matrix.m[2][1] = -Math.sin(fAngleRad);
    matrix.m[2][2] = Math.cos(fAngleRad);
    matrix.m[3][3] = 1.0;
    return matrix;
}
/**
 * @param {float} fAngleRad - Radians
 */
function Matrix_RotY(fAngleRad) {
    let matrix = new mat4x4();
    matrix.m[0][0] = Math.cos(fAngleRad);
    matrix.m[0][2] = Math.sin(fAngleRad);
    matrix.m[2][0] = -Math.sin(fAngleRad);
    matrix.m[1][1] = 1.0;
    matrix.m[2][2] = Math.cos(fAngleRad);
    matrix.m[3][3] = 1.0;
    return matrix;
}
/**
 * @param {float} fAngleRad - Radians
 */
function Matrix_RotZ(fAngleRad) {
    let matrix = new mat4x4();
    matrix.m[0][0] = Math.cos(fAngleRad);
    matrix.m[0][1] = Math.sin(fAngleRad);
    matrix.m[1][0] = -Math.sin(fAngleRad);
    matrix.m[1][1] = Math.cos(fAngleRad);
    matrix.m[2][2] = 1.0;
    matrix.m[3][3] = 1.0;
    return matrix;
}
function Matrix_Scale(s) {
    let matrix = new mat4x4();
    matrix.m[0][0] = s;
    matrix.m[1][1] = s;
    matrix.m[2][2] = s;
    return matrix;
}
function Matrix_Trans(x, y, z) {
    let mOut = new mat4x4();
    mOut.m[3][0] = x;
    mOut.m[3][1] = y;
    mOut.m[3][2] = z;
    return mOut
}
function Matrix_Projection(fFovDegrees, fAspectRatio, fNear, fFar) {
    let fFovRad = 1.0 / Math.tan(fFovDegrees * 0.5 / 180 * Math.PI);
    let matrix = new mat4x4();
    matrix.m[0][0] = fAspectRatio * fFovRad;
    matrix.m[1][1] = fFovRad;
    matrix.m[2][2] = fFar / (fFar - fNear);
    matrix.m[3][2] = (-fFar * fNear) / (fFar - fNear);
    matrix.m[2][3] = 1;
    matrix.m[3][3] = 0;
    return matrix;
}
function Matrix_View(vPos, vTarget, vUp) {
    let vNewForward = Vec_Sub(vTarget, vPos);
    vNewForward = Vec_Norm(vNewForward);

    let vNewUp = Vec_Mul(vNewForward, Vec_Dot(vNewForward, vUp));
    vNewUp = Vec_Sub(vUp, vNewUp);
    vNewUp = Vec_Norm(vNewUp);

    let vNewRight = Vec_Cross(vNewForward, vNewUp);

    let matrix = new mat4x4();
    matrix.m[0][0] = vNewRight.x;
    matrix.m[0][1] = vNewUp.x;
    matrix.m[0][2] = vNewForward.x;

    matrix.m[1][0] = vNewRight.y;
    matrix.m[1][1] = vNewUp.y;
    matrix.m[1][2] = vNewForward.y;

    matrix.m[2][0] = vNewRight.z;
    matrix.m[2][1] = vNewUp.z;
    matrix.m[2][2] = vNewForward.z;

    matrix.m[3][0] = -Vec_Dot(vPos, vNewRight);
    matrix.m[3][1] = -Vec_Dot(vPos, vNewUp);
    matrix.m[3][2] = -Vec_Dot(vPos, vNewForward);

    return matrix;
}

function Matrix_Mul(m1, m2) {
    let mOut = new mat4x4();
    for (var c = 0; c < 4; c++)
        for (var r = 0; r < 4; r++)
            mOut.m[r][c] = m1.m[r][0] * m2.m[0][c] +
                m1.m[r][1] * m2.m[1][c] +
                m1.m[r][2] * m2.m[2][c] +
                m1.m[r][3] * m2.m[3][c];
    return mOut;
}
function init() {
    let nShape;
    const models = [];
    let matProj;

    let vCamera;
    const vUp = new vec3d(0, 1, 0);
    let vLookDir;

    let fTheta = 0;
    let fYaw = 0;
    let fPitch = 0;

    let bViewWireFrame = false;
    let bRotate = false;

    Game.onUserCreate = function () {
        const origin = new vec3d(0, 5, 5);
        models.push(meshPyramid());
        models[0].worldMatrix = Matrix_Trans(origin.x, origin.y, origin.z);
        models.push(loadObjectFile(objTeapot, origin));
        models.push(loadObjectFile(objShip, origin));
        models.push(loadObjectFile(objAxis, origin));
        models.push(loadObjectFile(objMountains, new vec3d(-5, -7, 0)));

        nShape = 1;

        matProj = Matrix_Projection(90, ScreenHeight() / ScreenWidth(), 0.1, 1000);
        vCamera = new vec3d(0, 7, 0);
        vLookDir = new vec3d(0, 0, 1);

        bDebug = false;

        return true;
    }
    Game.update = function (fElapsedTime) {
        let vForward = Vec_Norm({ x: vLookDir.x, y: 0, z: vLookDir.z });
        vForward = Vec_Mul(vForward, 9 * fElapsedTime);
        const vRight = new vec3d(-vForward.z, 0, vForward.x);

        if (keyState[KEY.M].bPressed)
            bViewWireFrame = !bViewWireFrame;
        if (keyState[KEY.N].bPressed)
            bDebug = !bDebug;
        if (keyState[KEY.B].bPressed)
            bRotate = !bRotate;

        if (keyState[KEY.K1].bPressed)
            nShape = 0;
        else if (keyState[KEY.K2].bPressed)
            nShape = 1;
        else if (keyState[KEY.K3].bPressed)
            nShape = 2;
        else if (keyState[KEY.K4].bPressed)
            nShape = 3;
        else if (keyState[KEY.K5].bPressed)
            nShape = 4;

        if (keyState[KEY.W].bHeld)
            vCamera = Vec_Add(vCamera, vForward);
        if (keyState[KEY.S].bHeld)
            vCamera = Vec_Sub(vCamera, vForward);
        if (keyState[KEY.A].bHeld)
            vCamera = Vec_Add(vCamera, vRight);
        if (keyState[KEY.D].bHeld)
            vCamera = Vec_Sub(vCamera, vRight);

        if (keyState[KEY.Q].bHeld)
            vCamera.y += 5 * fElapsedTime;
        if (keyState[KEY.E].bHeld)
            vCamera.y -= 5 * fElapsedTime;

        if (keyState[KEY.LEFT].bHeld)
            fYaw += 2 * fElapsedTime;
        if (keyState[KEY.RIGHT].bHeld)
            fYaw -= 2 * fElapsedTime;
        if (keyState[KEY.UP].bHeld)
            fPitch = Math.max(fPitch - 2 * fElapsedTime, -80 * (Math.PI / 180));
        if (keyState[KEY.DOWN].bHeld)
            fPitch = Math.min(fPitch + 2 * fElapsedTime, 80 * (Math.PI / 1));

        const matRotY = Matrix_RotY(fTheta);
        if (bRotate)
            fTheta += 0.8 * fElapsedTime;

        const matWorld = Matrix_Mul(matRotY, models[nShape].worldMatrix);

        let vTarget = Matrix_Mul_Vector(new vec3d(0, 0, 1), Matrix_RotX(fPitch));
        const matCameraYaw = Matrix_RotY(fYaw);
        vLookDir = Matrix_Mul_Vector(vTarget, matCameraYaw);
        vTarget = Vec_Add(vLookDir, vCamera);
        const matView = Matrix_View(vCamera, vTarget, vUp);

        //<-----------RENDER---------------------------------------------->
        const vLight = Vec_Norm({ x: -3, y: -3, z: 4 });
        const clipped = [new triangle(), new triangle()];
        const vOffset = { x: 1, y: 1, z: 0 };
        const trianglesToRastorize = [];
        for (var tri of models[nShape].tris) {
            const triTransformed = new triangle();

            triTransformed.p[0] = Matrix_Mul_Vector(tri.p[0], matWorld);
            triTransformed.p[1] = Matrix_Mul_Vector(tri.p[1], matWorld);
            triTransformed.p[2] = Matrix_Mul_Vector(tri.p[2], matWorld);

            let normal = Vec_Cross(Vec_Sub(triTransformed.p[1], triTransformed.p[0]),
                Vec_Sub(triTransformed.p[2], triTransformed.p[0]));
            normal = Vec_Norm(normal);

            const vCameraRay = Vec_Sub(triTransformed.p[0], vCamera);

            if (Vec_Dot(normal, vCameraRay) < 0) {
                const triViewed = new triangle();
                const nBrightness = Math.max((Vec_Dot(vLight, normal) * -255), 15);
                triViewed.col = "rgb(" + nBrightness + "," + nBrightness + "," + nBrightness + ")";

                triViewed.p[0] = Matrix_Mul_Vector(triTransformed.p[0], matView);
                triViewed.p[1] = Matrix_Mul_Vector(triTransformed.p[1], matView);
                triViewed.p[2] = Matrix_Mul_Vector(triTransformed.p[2], matView);

                const nClippedTriangles = Triangle_ClipAgainstPlane(new vec3d(0, 0, 0.1), new vec3d(0, 0, 1), triViewed, clipped);

                for (var n = 0; n < nClippedTriangles; n++) {
                    const triProjected = new triangle();

                    triProjected.p[0] = Matrix_Mul_Vector(clipped[n].p[0], matProj);
                    triProjected.p[1] = Matrix_Mul_Vector(clipped[n].p[1], matProj);
                    triProjected.p[2] = Matrix_Mul_Vector(clipped[n].p[2], matProj);

                    triProjected.col = clipped[n].col;

                    triProjected.p[0] = Vec_Div(triProjected.p[0], triProjected.p[0].w);
                    triProjected.p[1] = Vec_Div(triProjected.p[1], triProjected.p[1].w);
                    triProjected.p[2] = Vec_Div(triProjected.p[2], triProjected.p[2].w);

                    triProjected.p[0].x *= -1;
                    triProjected.p[0].y *= -1;
                    triProjected.p[1].x *= -1;
                    triProjected.p[1].y *= -1;
                    triProjected.p[2].x *= -1;
                    triProjected.p[2].y *= -1;

                    triProjected.p[0] = Vec_Add(triProjected.p[0], vOffset);
                    triProjected.p[1] = Vec_Add(triProjected.p[1], vOffset);
                    triProjected.p[2] = Vec_Add(triProjected.p[2], vOffset);

                    triProjected.p[0].x *= 0.5 * ScreenWidth();
                    triProjected.p[0].y *= 0.5 * ScreenHeight();
                    triProjected.p[1].x *= 0.5 * ScreenWidth();
                    triProjected.p[1].y *= 0.5 * ScreenHeight();
                    triProjected.p[2].x *= 0.5 * ScreenWidth();
                    triProjected.p[2].y *= 0.5 * ScreenHeight();

                    trianglesToRastorize.push(triProjected);
                }
            }
        };
        trianglesToRastorize.sort((a, b) => {
            var z1 = (a.p[0].z + a.p[1].z + a.p[2].z) / 3;
            var z2 = (b.p[0].z + b.p[1].z + b.p[2].z) / 3;
            return (z1 > z2) ? -1 : 1;
        });
        Fill();

        for (var triToRaster of trianglesToRastorize) {
            const clipped = [new triangle(), new triangle()];
            const listTriangles = [];

            listTriangles.push(triToRaster);
            let nNewTriangles = 1;

            for (let p = 0; p < 4; p++) {
                let nTrisToAdd = 0;
                while (nNewTriangles > 0) {
                    const test = listTriangles[0];
                    listTriangles.shift();
                    nNewTriangles--;

                    switch (p) {
                        case 0:
                            nTrisToAdd = Triangle_ClipAgainstPlane(new vec3d(0, 0, 0), new vec3d(0, 1, 0), test, clipped);
                            break;
                        case 1:
                            nTrisToAdd = Triangle_ClipAgainstPlane(new vec3d(0, ScreenHeight(), 0), new vec3d(0, -1, 0), test, clipped);
                            break;
                        case 2:
                            nTrisToAdd = Triangle_ClipAgainstPlane(new vec3d(0, 0, 0), new vec3d(1, 0, 0), test, clipped);
                            break;
                        case 3:
                            nTrisToAdd = Triangle_ClipAgainstPlane(new vec3d(ScreenWidth(), 0, 0), new vec3d(-1, 0, 0), test, clipped);
                            break;
                    }
                    for (let w = 0; w < nTrisToAdd; w++)
                        listTriangles.push(clipped[w]);
                }
                nNewTriangles = listTriangles.length;
            }
            for (var v of listTriangles) {
                if (!bViewWireFrame)
                    FillTriangle(v.p[0].x, v.p[0].y, v.p[1].x, v.p[1].y, v.p[2].x, v.p[2].y, v.col);
                else
                    DrawTriangle(v.p[0].x, v.p[0].y, v.p[1].x, v.p[1].y, v.p[2].x, v.p[2].y, "#FFF");
            }
        }

        return true;
    }
    if (Game.ConstructCanvas(800, 450))
        Game.Start();
}
document.addEventListener("DOMContentLoaded", init);
