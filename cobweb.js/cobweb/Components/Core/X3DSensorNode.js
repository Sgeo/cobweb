
define ([
	"jquery",
	"cobweb/Components/Core/X3DChildNode",
	"cobweb/Bits/X3DConstants",
],
function ($,
          X3DChildNode, 
          X3DConstants)
{
	function X3DSensorNode (browser, executionContext)
	{
		X3DChildNode .call (this, browser, executionContext);

		this .addType (X3DConstants .X3DSensorNode);
	}

	X3DSensorNode .prototype = $.extend (new X3DChildNode (),
	{
		constructor: X3DSensorNode,
	});

	return X3DSensorNode;
});
