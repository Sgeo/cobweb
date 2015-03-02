
define ([
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/Rendering/X3DGeometryNode",
	"cobweb/Bits/X3DConstants",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DGeometryNode, 
          X3DConstants)
{
	with (Fields)
	{
		function LineSet (executionContext)
		{
			X3DGeometryNode .call (this, executionContext .getBrowser (), executionContext);

			this .addType (X3DConstants .LineSet);
		}

		LineSet .prototype = $.extend (new X3DGeometryNode (),
		{
			constructor: LineSet,
			fieldDefinitions: new FieldDefinitionArray ([
				new X3DFieldDefinition (X3DConstants .inputOutput, "metadata",    new SFNode ()),
				new X3DFieldDefinition (X3DConstants .inputOutput, "vertexCount", new MFInt32 ()),
				new X3DFieldDefinition (X3DConstants .inputOutput, "attrib",      new MFNode ()),
				new X3DFieldDefinition (X3DConstants .inputOutput, "fogCoord",    new SFNode ()),
				new X3DFieldDefinition (X3DConstants .inputOutput, "color",       new SFNode ()),
				new X3DFieldDefinition (X3DConstants .inputOutput, "coord",       new SFNode ()),
			]),
			getTypeName: function ()
			{
				return "LineSet";
			},
			getComponentName: function ()
			{
				return "Rendering";
			},
			getContainerField: function ()
			{
				return "geometry";
			},
		});

		return LineSet;
	}
});
