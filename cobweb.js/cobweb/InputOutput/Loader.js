
define ([
	"jquery",
	"cobweb/Parser/XMLParser",
	"standard/Networking/URI",
],
function ($, XMLParser, URI)
{
	function Loader (node)
	{
		this .node             = node;
		this .browser          = node .getBrowser ();
		this .executionContext = node .getExecutionContext ();
		this .URL              = new URI ();
	}
	
	Loader .timeOut = 16;

	Loader .prototype =
	{
		getWorldURL: function ()
		{
			return this .URL;
		},
		createX3DFromString: function (worldURL, string, success, error)
		{
			var scene = this .browser .createScene ();

			scene .setWorldURL (this .browser .getLocation () .transform (worldURL));

			if (success)
			{
				try
				{
					setTimeout (this .importDocument .bind (this, scene, $.parseXML (string), success, error), Loader .timeOut);
				}
				catch (exception)
				{
					error (exception);
				}
			}
			else
			{
				this .importDocument (scene, $.parseXML (string));
				return scene;
			}
		},
		importDocument: function (scene, dom, success, error)
		{
			try
			{
				new XMLParser (scene, dom) .parseIntoScene ();

				if (success)
					setTimeout (success .bind (this, scene), Loader .timeOut);
			}
			catch (exception)
			{
				if (error)
					error (exception);
				else
					throw exception;
			}
		},
		createX3DFromURL: function (url, callback)
		{
			if (callback)
			{
				this .url      = url .copy ();
				this .callback = callback;

				return this .createX3DFromURLAsync (this .url .shift ());
			}

			return this .createX3DFromURLSync (url);
		},
		createX3DFromURLAsync: function (URL)
		{
			this .URL = this .transform (URL);

			function error (exception)
			{
				console .log (exception);
				//console .warn ("Couldn't load URL '" + this .URL .toString () + "': " + exception .message + ".");

				if (this .url .length)
					this .createX3DFromURLAsync (this .url .shift ());

				else
					this .callback (null);
			}
	
			$.ajax ({
				url: this .URL,
				dataType: "text",
				async: true,
				//timeout: 15000,
				global: false,
				context: this,
				success: function (data)
				{
					this .createX3DFromString (this .URL, data, this .callback, error .bind (this));
				},
				error: function (jqXHR, textStatus, exception)
				{
					error .call (this, exception);
				},
			});
		},
		createX3DFromURLSync: function (url)
		{
			var scene   = null;
			var success = false;

			for (var i = 0; i < url .length; ++ i)
			{
				this .URL = this .transform (url [i]);

				$.ajax ({
					url: this .URL,
					dataType: "text",
					async: false,
					//timeout: 15000,
					global: false,
					context: this,
					success: function (data)
					{
						try
						{
							scene   = this .createX3DFromString (this .URL, data);
							success = true;
						}
						catch (error)
						{
							console .log (error);
						}
					},
					error: function (jqXHR, textStatus, errorThrown)
					{
						//console .warn ("Couldn't load URL '" + this .URL .toString () + "': " + errorThrown + ".");
					},
				});

				if (success)
					break;
			}

			if (success)
				return scene;

			throw Error ("Couldn't load any url of '" + url .getValue () .join (", ") + "'.");
		},
		transform: function (URL)
		{
			URL = this .getReferer () .transform (new URI (URL));

			//console .info ("Trying to load URL '" + URL .toString () + "'.");

			return URL .isLocal () ? this .browser .getLocation () .getRelativePath (URL) : URL;
		},
		getReferer: function ()
		{
			if (this .node === this .browser .getWorld ())
			{
				if (this .browser .getScriptStack () .length === 1)
					return this .browser .getLocation ();
			}

			return this .executionContext .getWorldURL ();
		},
	};

	return Loader;
});