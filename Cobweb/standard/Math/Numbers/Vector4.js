
define ([
	"standard/Math/Algorithm",
],
function (Algorithm)
{
	function Vector4 (x, y, z, w)
	{		
		if (arguments .length)
		{
			this .x = x;
			this .y = y;
			this .z = z;
			this .w = w;
		}
		else
		{
			this .x = 0;
			this .y = 0;
			this .z = 0;
			this .w = 0;
		}
	}

	Vector4 .prototype =
	{
		constructor: Vector4,
		length: 4,
		copy: function ()
		{
			return new Vector4 (this .x,
			                    this .y,
			                    this .z,
			                    this .w);
		},
		assign: function (vector)
		{
			this .x = vector .x;
			this .y = vector .y;
			this .z = vector .z;
			this .w = vector .w;
		},
		set: function (x, y, z, w)
		{
			this .x = x;
			this .y = y;
			this .z = z;
			this .w = w;
		},
		equals: function (vector)
		{
			return this .x === vector .x &&
			       this .y === vector .y &&
			       this .z === vector .z &&
			       this .w === vector .w;
		},
		negate: function ()
		{
			return new Vector4 (-this .x,
			                    -this .y,
			                    -this .z,
			                    -this .w);
		},
		add: function (vector)
		{
			return new Vector4 (this .x + vector .x,
			                    this .y + vector .y,
			                    this .z + vector .z,
			                    this .w + vector .w);
		},
		subtract: function (vector)
		{
			return new Vector4 (this .x - vector .x,
			                    this .y - vector .y,
			                    this .z - vector .z,
			                    this .w - vector .w);
		},
		multiply: function (value)
		{
			return new Vector4 (this .x * value,
			                    this .y * value,
			                    this .z * value,
			                    this .w * value);
		},
		multVec: function (vector)
		{
			return new Vector4 (this .x * vector .x,
			                    this .y * vector .y,
			                    this .z * vector .z,
			                    this .w * vector .w);
		},
		divide: function (value)
		{
			return new Vector4 (this .x / value,
			                    this .y / value,
			                    this .z / value,
			                    this .w / value);
		},
		divVec: function (vector)
		{
			return new Vector4 (this .x / vector .x,
			                    this .y / vector .y,
			                    this .z / vector .z,
			                    this .w / vector .w);
		},
		normalize: function ()
		{
			var length = this .abs ();
			
			if (length)
				return this .divide (length);

			return new Vector4 (0, 0, 0, 0);
		},
		dot: function (vector)
		{
			return this .x * vector .x +
			       this .y * vector .y +
			       this .z * vector .z +
			       this .w * vector .w;
		},
		norm: function ()
		{
			return this .dot (this);
		},
		abs: function ()
		{
			return Math .sqrt (this .norm ());
		},
		lerp: function (vector, t)
		{
			return new Vector4 (Algorithm .lerp (this .x, vector .x, t),
			                    Algorithm .lerp (this .y, vector .y, t),
			                    Algorithm .lerp (this .z, vector .z, t),
			                    Algorithm .lerp (this .w, vector .w, t));
		},
		min: function (vector)
		{
			return new Vector4 (Math .min (this .x, vector .x),
			                    Math .min (this .y, vector .y),
			                    Math .min (this .z, vector .z),
			                    Math .min (this .w, vector .w));
		},
		max: function (vector)
		{
			return new Vector4 (Math .max (this .x, vector .x),
			                    Math .max (this .y, vector .y),
			                    Math .max (this .z, vector .z),
			                    Math .max (this .w, vector .w));
		},
		toString: function ()
		{
			return this .x + " " +
			       this .y + " " +
			       this .z + " " +
			       this .w;
		}
	};

	Object .defineProperty (Vector4 .prototype, "0",
	{
		get: function () { return this .x; },
		set: function (value) { this .x = value; },
		enumerable: false,
		configurable: false
	});

	Object .defineProperty (Vector4 .prototype, "1",
	{
		get: function () { return this .y; },
		set: function (value) { this .y = value; },
		enumerable: false,
		configurable: false
	});

	Object .defineProperty (Vector4 .prototype, "2",
	{
		get: function () { return this .z; },
		set: function (value) { this .z = value; },
		enumerable: false,
		configurable: false
	});

	Object .defineProperty (Vector4 .prototype, "3",
	{
		get: function () { return this .w; },
		set: function (value) { this .w = value; },
		enumerable: false,
		configurable: false
	});

	return Vector4;
});
