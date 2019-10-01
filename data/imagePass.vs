in vec3 uv_vertexAttrib;
out vec2 texCoord;
out float camDist;

uniform mat4 uv_modelViewProjectionMatrix;
uniform mat4 uv_scene2ObjectMatrix;
uniform mat4 uv_modelViewInverseMatrix;
uniform mat4 uv_modelInverseMatrix;
uniform vec4 uv_cameraPos;
uniform vec3 uv_upVec3;

uniform float altitude;
uniform float azimuth;
uniform vec2 imageQuadSize;

uniform float imageDepth;


const float PI = 3.1415926;
const float DEG2PI = PI/180;
vec3 targetPosInObjSpace;
vec3 eyePosInObjectSpace;
vec3 imagePositionInObjSpace;
vec3 upVectorInObjSpace;

void emit(float azimuthAngleInRigSpace, float polarAngleInRigSpace, vec2 textureCoords){
	azimuthAngleInRigSpace *= DEG2PI;
	polarAngleInRigSpace *= DEG2PI;
	texCoord = textureCoords;
	vec3 rigSpacePosition;
	rigSpacePosition.x = sin(azimuthAngleInRigSpace)*cos(polarAngleInRigSpace);
	rigSpacePosition.y = sin(polarAngleInRigSpace);
	rigSpacePosition.z = -cos(azimuthAngleInRigSpace)*cos(polarAngleInRigSpace);
	vec3 objectSpaceDirection = normalize((uv_modelInverseMatrix * vec4(rigSpacePosition,0)).xyz);
	vec3 objectSpacePosition = eyePosInObjectSpace + objectSpaceDirection*imageDepth;
	gl_Position = uv_modelViewProjectionMatrix*vec4(objectSpacePosition,1.);
}

void main(void)
{
   	eyePosInObjectSpace = (uv_scene2ObjectMatrix*uv_cameraPos).xyz; 
	camDist = length(eyePosInObjectSpace);
	vec2 angles = vec2(azimuth,altitude)+(imageQuadSize/2.*uv_vertexAttrib.xy);
	emit(angles.x,angles.y, 0.5*uv_vertexAttrib.xy+vec2(0.5));	   
}