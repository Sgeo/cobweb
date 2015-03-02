
define ([
	"jquery",
	"cobweb/Base/X3DEventObject",
	"cobweb/Bits/X3DConstants",
],
function ($, X3DEventObject, X3DConstants)
{
	function X3DBaseNode (browser, executionContext)
	{
		X3DEventObject .call (this, browser);

		this .executionContext = executionContext;
		this .type             = [ X3DConstants .X3DBaseNode ];
		this .fields           = { };

		for (var i = 0; i < this .fieldDefinitions .length; ++ i)
			this .addField (this .fieldDefinitions [i]);
	}

	X3DBaseNode .prototype = $.extend (new X3DEventObject (),
	{
		constructor: X3DBaseNode,
		fieldDefinitions: [ ],
		getExecutionContext: function ()
		{
			return this .executionContext;
		},
		addType: function (value)
		{
			this .type .push (value);
		},
		getType: function ()
		{
			return this .type;
		},
		getInnerNode: function ()
		{
			return this;
		},
		addChildren: function (name, field)
		{
			for (var i = 0; i < arguments .length; i += 2)
				this .addChild (arguments [i + 0], arguments [i + 1]);
		},
		addChild: function (name, field)
		{
			field .addParent (this);
			field .setName (name);

			Object .defineProperty (this, name + "_",
			{
				get: function () { return field; },
				set: function (value) { field .setValue (value); },
				enumerable: true,
				configurable: false,
			});
		},
		addField: function (fieldDefinition)
		{
			var accessType = fieldDefinition .accessType;
			var name       = fieldDefinition .name;
			var field      = fieldDefinition .value .copy ();

			field .setTainted (true);
			field .addParent (this);
			field .setName (name);
			field .setAccessType (accessType);

			this .fields [name] = field;
			
			if (accessType === X3DConstants .inputOutput)
			{
				this .fields ["set_" + name]     = field;
				this .fields [name + "_changed"] = field;
			}

			Object .defineProperty (this, name + "_",
			{
				get: function () { return field; },
				set: function (value) { field .setValue (value); },
				enumerable: true,
				configurable: false,
			});
		},
		getField: function (name)
		{
			var field = this .fields [name];
			
			if (field)
				return field;

			throw Error ("Unkown field '" + name + "' in node class " + this .getTypeName ());
		},
		getFieldDefinitions: function ()
		{
			return this .fieldDefinitions;
		},
		setup: function ()
		{
			for (var i = 0; i < this .fieldDefinitions .length; ++ i)
				this .fields [this .fieldDefinitions [i] .name] .setTainted (false);

			this .initialize ();
		},
		initialize: function () { },
		traverse: function () { },
		toString: function ()
		{
			return this .getTypeName () + " { }";
		},
	});

	return X3DBaseNode;
});