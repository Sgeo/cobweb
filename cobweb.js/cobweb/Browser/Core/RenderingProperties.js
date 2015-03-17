
define ([
	"jquery",
	"cobweb/Basic/X3DBaseNode",
],
function ($,
          X3DBaseNode)
{
	function RenderingProperties (executionContext)
	{
		X3DBaseNode .call (this, executionContext .getBrowser (), executionContext);
	}

	RenderingProperties .prototype = $.extend (new X3DBaseNode (),
	{
		constructor: RenderingProperties,
		initialize: function ()
		{
			X3DBaseNode .prototype .initialize .call (this);

			this .element   = $("<div/>") .addClass ("renderingProperties") .appendTo (this .getBrowser () .getX3D () .find (".canvas"));
			this .enabled   = false;
			this .startTime = 0;
			this .frames    = 0;
		},
		setEnabled: function (value)
		{
			this .enabled = value;
			
			if (value)
			{
				this .element .fadeIn ();
				this .getBrowser () .prepareEvents () .addInterest (this, "update");
				this .update ();
			}
			else
			{
				this .element .fadeOut ();
				this .getBrowser () .prepareEvents () .removeInterest (this, "update");
			}
		},
		getEnabled: function ()
		{
			return this .enabled;
		},
		update: function ()
		{
			var currentTime = this .getBrowser () .getCurrentTime ();
		
			if (currentTime - this .startTime > 1)
			{
				var
					layers            = this .getBrowser () .getWorld () .getLayerSet () .getLayers ()
					traverseTime      = 0,
					drawTime          = 0,
					opaqueShapes      = 0,
					transparentShapes = 0,
					sensors           = 0;

				for (var i = 0; i < layers .length; ++ i)
				{
					var layer = layers [i];
					traverseTime      += layer .traverseTime;
					drawTime          += layer .drawTime;
					opaqueShapes      += layer .numOpaqueShapes;
					transparentShapes += layer .numTransparentShapes;
				}
				
				sensors += Object .keys (this .getBrowser () .prepareEvents () .getInterests ()) .length;
				sensors += Object .keys (this .getBrowser () .getSensors () .getInterests ()) .length;

				var text = "";
				text += "Rendering Properties\n\n";
				text += "Frame rate: " + (this .frames / (currentTime - this .startTime)) .toFixed (2) .toLocaleString () + " fps\n";
				text += "Traverse:   " + traverseTime .toFixed (2) .toLocaleString () + " ms" + "\n";
				text += "Draw:       " + drawTime .toFixed (2) .toLocaleString () + " ms" + "\n";
				text += "Shapes:     " + opaqueShapes + " / " + transparentShapes + "\n";
				text += "Sensors:    " + sensors + "\n";

				this .element .text (text);

				this .frames    = 0;
				this .startTime = currentTime;
			}
			else
				++ this .frames;
		},
	});

	return RenderingProperties;
});
