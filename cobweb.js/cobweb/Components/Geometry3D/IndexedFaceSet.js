
// https://github.com/r3mi/poly2tri.js

define ([
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/Rendering/X3DComposedGeometryNode",
	"cobweb/Bits/X3DConstants",
	"standard/Math/Numbers/Vector3",
	"standard/Math/Numbers/Matrix4",
	"poly2tri",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DComposedGeometryNode, 
          X3DConstants,
          Vector3,
          Matrix4,
          poly2tri)
{
	with (Fields)
	{
		function IndexedFaceSet (executionContext)
		{
			X3DComposedGeometryNode .call (this, executionContext .getBrowser (), executionContext);

			this .addType (X3DConstants .IndexedFaceSet);
		}

		IndexedFaceSet .prototype = $.extend (Object .create (X3DComposedGeometryNode .prototype),
		{
			constructor: IndexedFaceSet,
			fieldDefinitions: new FieldDefinitionArray ([
				new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata",        new SFNode ()),
				new X3DFieldDefinition (X3DConstants .initializeOnly, "solid",           new SFBool (true)),
				new X3DFieldDefinition (X3DConstants .initializeOnly, "ccw",             new SFBool (true)),
				new X3DFieldDefinition (X3DConstants .initializeOnly, "convex",          new SFBool (true)),
				new X3DFieldDefinition (X3DConstants .initializeOnly, "creaseAngle",     new SFFloat ()),
				new X3DFieldDefinition (X3DConstants .initializeOnly, "colorPerVertex",  new SFBool (true)),
				new X3DFieldDefinition (X3DConstants .initializeOnly, "normalPerVertex", new SFBool (true)),
				new X3DFieldDefinition (X3DConstants .inputOutput,    "colorIndex",      new MFInt32 ()),
				new X3DFieldDefinition (X3DConstants .inputOutput,    "texCoordIndex",   new MFInt32 ()),
				new X3DFieldDefinition (X3DConstants .inputOutput,    "normalIndex",     new MFInt32 ()),
				new X3DFieldDefinition (X3DConstants .inputOutput,    "coordIndex",      new MFInt32 ()),
				new X3DFieldDefinition (X3DConstants .inputOutput,    "attrib",          new MFNode ()),
				new X3DFieldDefinition (X3DConstants .inputOutput,    "fogCoord",        new SFNode ()),
				new X3DFieldDefinition (X3DConstants .inputOutput,    "color",           new SFNode ()),
				new X3DFieldDefinition (X3DConstants .inputOutput,    "texCoord",        new SFNode ()),
				new X3DFieldDefinition (X3DConstants .inputOutput,    "normal",          new SFNode ()),
				new X3DFieldDefinition (X3DConstants .inputOutput,    "coord",           new SFNode ()),
			]),
			getTypeName: function ()
			{
				return "IndexedFaceSet";
			},
			getComponentName: function ()
			{
				return "Geometry3D";
			},
			getContainerField: function ()
			{
				return "geometry";
			},
			getTexCoordPerVertexIndex: function (index)
			{
				if (index < this .texCoordIndex_ .length)
					return this .texCoordIndex_ [index];

				return this .coordIndex_ [index];
			},
			getColorPerVertexIndex: function (index)
			{
				if (index < this .colorIndex_ .length)
					return this .colorIndex_ [index];

				return this .coordIndex_ [index];
			},
			getColorIndex: function (index)
			{
				if (index < this .colorIndex_ .length)
					return this .colorIndex_ [index];

				return index;
			},
			getNormalPerVertexIndex: function (index)
			{
				if (index < this .normalIndex_ .length)
					return this .normalIndex_ [index];

				return this .coordIndex_ [index];
			},
			getNormalIndex: function (index)
			{
				if (index < this .normalIndex_ .length)
					return this .normalIndex_ [index];

				return index;
			},
			build: function ()
			{
				// Triangulate
				var polygons = this .triangulate ();

				// Build arrays

				if (polygons .length === 0)
					return;

				// Fill GeometryNode

				var
					colorPerVertex  = this .colorPerVertex_ .getValue (),
					normalPerVertex = this .normalPerVertex_ .getValue (),
					coordIndex      = this .coordIndex_ .getValue (),
					colorNode       = this .getColor (),
					texCoordNode    = this .getTexCoord (),
					normalNode      = this .getNormal (),
					coordNode       = this .getCoord (),
					face            = 0;

				if (texCoordNode)
					texCoordNode .init (this .getTexCoords ());

				for (var p = 0, pl = polygons .length; p < pl; ++ p)
				{
					var triangles = polygons [p] .triangles;

					for (var t = 0, tl = triangles .length; t < tl; ++ t)
					{
						var triangle = triangles [t];

						for (var v = 0; v < 3; ++ v)
						{
							var
								i     = triangle [v],
								index = coordIndex [i] .getValue ();

							if (colorNode)
							{
								if (colorPerVertex)
									this .addColor (colorNode .getColor (this .getColorPerVertexIndex (i)));
								else
									this .addColor (colorNode .getColor (this .getColorIndex (face)));
							}

							if (texCoordNode)
								texCoordNode .addTexCoord (this .getTexCoords (), this .getTexCoordPerVertexIndex (i));

							if (normalNode)
							{
								if (normalPerVertex)
									this .addNormal (normalNode .getVector (this .getNormalPerVertexIndex (i)));

								else
									this .addNormal (normalNode .getVector (this .getNormalIndex (face)));
							}

							this .addVertex (coordNode .getPoint (index));
						}
					}

					++ face;
				}

				// Autogenerate normal if not specified.

				if (! this .getNormal ())
					this .buildNormals (polygons);

				this .setSolid (this .solid_ .getValue ());
				this .setCCW (this .ccw_ .getValue ());
				this .setCurrentTexCoord (this .getTexCoord ());
			},
			triangulate: function ()
			{
				var
					convex      = this .convex_ .getValue (),
					coordIndex  = this .coordIndex_ .getValue (),
					coordLength = coordIndex .length,
					polygons    = [ ];

				if (! this .getCoord ())
					return polygons;

				if (coordLength)
				{
					// Add -1 (polygon end marker) to coordIndex if not present.
					if (this .coordIndex_ [coordLength - 1] > -1)
						this .coordIndex_ .push (-1);

					// Construct triangle array and determine the number of used points.
					var i = 0;

					polygons .push ({ vertices: [ ], triangles: [ ] });

					for (var c = 0; c < coordLength; ++ c)
					{
						var
							index    = coordIndex [c] .getValue (),
							vertices = polygons [polygons .length - 1] .vertices;
	
						if (index > -1)
						{
							// Add vertex index.
							vertices .push (i);
						}
						else
						{
							// Negativ index.

							if (vertices .length)
							{
								// Closed polygon.
								if (vertices [0] === vertices [vertices .length - 1])
									vertices .pop ();

								switch (vertices .length)
								{
									case 0:
									case 1:
									case 2:
									{
										vertices .length = 0;
										break;
									}
									case 3:
									{
										// Add polygon with one triangle.
					
										polygons [polygons .length - 1] .triangles .push (vertices);
										polygons .push ({ vertices: [ ], triangles: [ ] });
										break;
									}
									default:
									{
										// Triangulate polygons.
										
										if (convex)
											this .triangulateConvexPolygon (polygons [polygons .length - 1]);
										else
											this .triangulatePolygon (polygons [polygons .length - 1]);

										if (polygons [polygons .length - 1] .triangles .length)
											polygons .push ({ vertices: [ ], triangles: [ ] });
										else
											vertices .length = 0;

										break;
									}
								}
							}
						}

						++ i;
					}

					if (polygons [polygons .length - 1] .triangles .length === 0)
						polygons .pop ();
				}

				return polygons;
			},
			triangulatePolygon: function (polygon)
			{
				try
				{
					// Transform vertices to 2D space.

					var
						vertices   = polygon .vertices,
						triangles  = polygon .triangles,
						coordIndex = this .coordIndex_ .getValue (),
						coord      = this .getCoord ();

					var
						p0 = coord .getPoint (coordIndex [vertices [0]] .getValue ()),
						p1 = coord .getPoint (coordIndex [vertices [1]] .getValue ());

					var
						zAxis = this .getPolygonNormal (vertices, coordIndex, coord),
						xAxis = Vector3 .subtract (p1, p0),
						yAxis = Vector3 .cross (zAxis, xAxis);

					xAxis .normalize ();
					yAxis .normalize ();

					var matrix = new Matrix4 (xAxis .x, xAxis .y, xAxis .z, 0,
					                          yAxis .x, yAxis .y, yAxis .z, 0,
					                          zAxis .x, zAxis .y, zAxis .z, 0,
					                          p0 .x, p0 .y, p0 .z, 1);

					matrix .inverse ();

					var contour = [ ];

					for (var i = 0, length = vertices .length; i < length; ++ i)
					{
						var
							index   = vertices [i],
							vertex2 = matrix .multVecMatrix (coord .getPoint (coordIndex [index] .getValue ()) .copy ());

						vertex2 .index = index;
						contour .push (vertex2);
					}

					// Triangulate polygon.

					var
						context = new poly2tri .SweepContext (contour),
						ts      = context .triangulate () .getTriangles ();

					for (var i = 0, length = ts .length; i < length; ++ i)
						triangles .push ([ ts [i] .getPoint (0) .index, ts [i] .getPoint (1) .index, ts [i] .getPoint (2) .index ]);
				}
				catch (error)
				{
					//console .warn (error);
					this .triangulateConvexPolygon (polygon);
				}
			},
			triangulateConvexPolygon: function (polygon)
			{
				var
					vertices  = polygon .vertices,
					triangles = polygon .triangles;

				// Fallback: Very simple triangulation for convex polygons.
				for (var i = 1, length = vertices .length - 1; i < length; ++ i)
					triangles .push ([ vertices [0], vertices [i], vertices [i + 1] ]);
			},
			buildNormals: function (polygons)
			{
				var normals = this .createNormals (polygons);

				for (var p = 0, pl = polygons .length; p < pl; ++ p)
				{
					var triangles = polygons [p] .triangles;
				
					for (var t = 0, tl = triangles .length; t < tl; ++ t)
					{
						var triangle = triangles [t];
					
						this .addNormal (normals [triangle [0]]);
						this .addNormal (normals [triangle [1]]);
						this .addNormal (normals [triangle [2]]);
					}
				}
			},
			createNormals: function (polygons)
			{
				var
					cw          = ! this .ccw_ .getValue (),
					normals     = [ ],
					normalIndex = [ ],
					coordIndex  = this .coordIndex_ .getValue (),
					coord       = this .getCoord (),
					normal      = null;

				for (var p = 0, pl = polygons .length; p < pl; ++ p)
				{
					var
						polygon  = polygons [p],
						vertices = polygon .vertices,
						length   = vertices .length;

					switch (length)
					{
						case 3:
						{
							normal = coord .getNormal (coordIndex [vertices [0]] .getValue (),
							                           coordIndex [vertices [1]] .getValue (),
							                           coordIndex [vertices [2]] .getValue ());
							break;
						}
						case 4:
						{
							normal = coord .getQuadNormal (coordIndex [vertices [0]] .getValue (),
							                               coordIndex [vertices [1]] .getValue (),
							                               coordIndex [vertices [2]] .getValue (),
							                               coordIndex [vertices [3]] .getValue ());
							break;
						}
						default:
						{
							normal = this .getPolygonNormal (vertices, coordIndex, coord);
							break;
						}
					}

					// Add a normal index for each point.
					for (var i = 0; i < length; ++ i)
					{
						var index = coordIndex [vertices [i]] .getValue ();

						if (! normalIndex [index])
							normalIndex [index] = [ ];

						normalIndex [index] .push (normals .length + i);
					}

					if (cw)
						normal .negate ();

					// Add this normal for each vertex and for -1.

					for (var i = 0, nl = length + 1; i < nl; ++ i)
						normals .push (normal);
				}

				return this .refineNormals (normalIndex, normals, this .creaseAngle_ .getValue ());
			},
			getPolygonNormal: function (vertices, coordIndex, coord)
			{
				// Determine polygon normal.
				// We use Newell's method https://www.opengl.org/wiki/Calculating_a_Surface_Normal here:

				var
					normal = new Vector3 (0, 0, 0),
					next   = coord .getPoint (coordIndex [vertices [0]] .getValue ());

				for (var i = 0, length = vertices .length; i < length; ++ i)
				{
					var
						current = next,
						next    = coord .getPoint (coordIndex [vertices [(i + 1) % length]] .getValue ());

					normal .x += (current .y - next .y) * (current .z + next .z);
					normal .y += (current .z - next .z) * (current .x + next .x);
					normal .z += (current .x - next .x) * (current .y + next .y);
				}

				return normal .normalize ();
			},
		});

		return IndexedFaceSet;
	}
});

