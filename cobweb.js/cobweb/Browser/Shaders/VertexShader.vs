// -*- Mode: C++; coding: utf-8; tab-width: 3; indent-tabs-mode: tab; c-basic-offset: 3 -*-
precision mediump float;

uniform mat4 textureMatrix;
uniform mat3 normalMatrix;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

attribute vec4 color;
attribute vec4 texCoord;
attribute vec3 normal;
attribute vec4 position;

varying vec4 C; // color
varying vec4 t; // texCoord
varying vec3 N; // normalized normal vector at this point on geometry
varying vec3 v; // point on geometry

void
main ()
{
	C = color;
	t = textureMatrix * texCoord;
	N = normalize (normalMatrix * normal);
	v = vec3 (modelViewMatrix * position);

	gl_Position = projectionMatrix * modelViewMatrix * position;
}