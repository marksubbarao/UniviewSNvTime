//precision highp float;
uniform int uv_simulationtimeDays;
uniform float uv_simulationtimeSeconds;

uniform float uv_fade;
uniform float uv_alpha;

uniform float imageAlpha;
uniform vec3 imageColor;
uniform bool useUniviewTime;
uniform sampler2D stateTexture;
uniform sampler2D numbersTex;

in float camDist;
in vec2 texCoord;

out vec4 fragColor;


void main(void)
{
	float eventTime = texture(stateTexture, vec2(0.5)).r;
	if (useUniviewTime){
		float dayfract = uv_simulationtimeSeconds/(24.0*3600.0);
		eventTime = (uv_simulationtimeDays + dayfract)/365.2425 + 1970.;
	}

    int digitSlot = int(4.*texCoord[0]);
	vec2 newTexCoord = vec2(fract(4.*texCoord[0]),texCoord[1]);
	vec4 color= vec4(0.0);
		int place = 4- digitSlot ;
		if (abs(eventTime)>pow(10.,(place-1.))) {
			int num2use = int(10.*fract(abs(eventTime)*pow(10.,0.-place)));	
			vec2 numCoords = vec2(0.1*fract(4.*texCoord[0])+0.1*num2use,texCoord[1]);
			color = texture(numbersTex,numCoords);
		}

	color.rgb *=imageColor;
	color.a *= uv_alpha*uv_fade*imageAlpha;
	fragColor = color;
}