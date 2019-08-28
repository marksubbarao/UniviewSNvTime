uniform float uv_fade;

uniform sampler2D cmap;
uniform float eventTime;
uniform float tfac;
uniform float tmax;

in vec2 texcoord;
in float type;

out vec4 fragColor;

void main()
{
	vec3 color = texture(cmap ,vec2(clamp(type, 0., 0.99), 0.5)).rgb;

	fragColor = vec4(color, uv_fade);

	vec2 fromCenter = texcoord*2. - vec2(1.);
	float dist = dot(fromCenter, fromCenter);
	fragColor.a *= exp(-0.5*dist/0.1);


}
