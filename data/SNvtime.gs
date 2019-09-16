layout(triangles) in;
layout(triangle_strip, max_vertices = 4) out;

uniform mat4 uv_modelViewProjectionMatrix;
uniform mat4 uv_modelViewInverseMatrix;
uniform vec4 uv_cameraPos;

uniform float radiusScale;
uniform float SNduration;
uniform float SNtmin;
uniform float SNangleMax;
uniform bool fadeOutSN;
uniform bool showBoth;
uniform float bothYr;

uniform sampler2D stateTexture;

out vec2 texcoord;
out float type;
out float eventTime;

// axis should be normalized
mat3 rotationMatrix(vec3 axis, float angle)
{
	float s = sin(angle);
	float c = cos(angle);
	float oc = 1.0 - c;
	
	return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
				oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
				oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c);
}

void drawSprite(vec4 position, float radius, float rotation)
{
	vec3 objectSpaceUp = vec3(0, 0, 1);
	vec3 objectSpaceCamera = (uv_modelViewInverseMatrix * vec4(0, 0, 0, 1)).xyz;
	vec3 cameraDirection = normalize(objectSpaceCamera - position.xyz);
	vec3 orthogonalUp = normalize(objectSpaceUp - cameraDirection * dot(cameraDirection, objectSpaceUp));
	vec3 rotatedUp = rotationMatrix(cameraDirection, rotation) * orthogonalUp;
	vec3 side = cross(rotatedUp, cameraDirection);
	texcoord = vec2(0, 1);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (-side + rotatedUp), 1);
	EmitVertex();
	texcoord = vec2(0, 0);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (-side - rotatedUp), 1);
	EmitVertex();
	texcoord = vec2(1, 1);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (side + rotatedUp), 1);
	EmitVertex();
	texcoord = vec2(1, 0);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (side - rotatedUp), 1);
	EmitVertex();
	EndPrimitive();
}

// Equation 7 from [this paper](https://arxiv.org/abs/1612.02097)
float SNIaLum(float t, float A, float t0, float tb, float a1, float a2, float s)
{
	float ar = 2.*(a1 + 1.);
	float ad = a1 - a2;
	float tfac = (t - t0)/tb;
	return A * pow(tfac,ar) * pow( 1. + pow(tfac,(s*ad)), -2./s );
}

void main()
{
	//get the time from the texture
	eventTime = texture(stateTexture, vec2(0.5)).r;

	float time = gl_in[1].gl_Position.x;
	float log10lum = gl_in[1].gl_Position.y;
	type = gl_in[1].gl_Position.z;

	vec4 pos = vec4(gl_in[0].gl_Position.x, gl_in[0].gl_Position.y, gl_in[0].gl_Position.z, 1.);

	float a1 = 0.1;
	float a2 = -2.2;
	float s = 0.6;
	float tp = SNduration*pow(-1.*(a1 + 1.)/(a2 + 1.), 1./(s*(a1 - a2)) );
	float useT0 = time - tp;
	float useTime = eventTime;
	if (!fadeOutSN && useTime > time){
		useTime = time;
	}
	float lum = SNIaLum(useTime, log10lum, useT0, SNduration, a1, a2, s);

	//limit the size (which is scaled by the luminosity) based on the camera location
	if (lum > 0){
		float dist = length(pos.xyz - uv_cameraPos.xyz);
		float angle = atan(lum/2., dist);
		if (angle > SNangleMax){
			lum = 2.*dist*tan(SNangleMax);
		}

		if (useT0 > SNtmin){
			drawSprite(pos, radiusScale*lum, 0);
		}
		if (showBoth && useT0 + bothYr > SNtmin){ //showing Nov 2018 and 2023 simultaneously
			drawSprite(pos, radiusScale*lum, 0);

		}
	}
}
