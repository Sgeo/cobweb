data:text/plain;charset=utf-8,
// -*- Mode: C++; coding: utf-8; tab-width: 3; indent-tabs-mode: tab; c-basic-offset: 3 -*-

precision mediump float;

#define MAX_CLIP_PLANES 6

// 30
uniform bool x3d_ClipPlaneEnabled [MAX_CLIP_PLANES];
uniform vec4 x3d_ClipPlaneVector [MAX_CLIP_PLANES];

varying vec3 v; // point on geometry

void
clip ()
{
	for (int i = 0; i < MAX_CLIP_PLANES; ++ i)
	{
		if (x3d_ClipPlaneEnabled [i])
		{
			if (dot (v, x3d_ClipPlaneVector [i] .xyz) - x3d_ClipPlaneVector [i] .w < 0.0)
			{
				discard;
			}
		}
		else
			break;
	}
}

vec3
pack (float f)
{
	vec3 color;

	f *= 255.0;
	color .r = floor (f);

	f -= color .r;
	f *= 255.0;
	color .g = floor (f);

	f -= color .g;
	f *= 255.0;
	color .b = floor (f);

	return color / 255.0;
}

void
main ()
{
	clip ();

	gl_FragColor .rgb = pack (gl_FragCoord .z);
}
