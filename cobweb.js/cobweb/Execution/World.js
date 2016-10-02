/* -*- Mode: JavaScript; coding: utf-8; tab-width: 3; indent-tabs-mode: tab; c-basic-offset: 3 -*-
 *******************************************************************************
 *
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * Copyright create3000, Scheffelstraße 31a, Leipzig, Germany 2011.
 *
 * All rights reserved. Holger Seelig <holger.seelig@yahoo.de>.
 *
 * The copyright notice above does not evidence any actual of intended
 * publication of such source code, and is an unpublished work by create3000.
 * This material contains CONFIDENTIAL INFORMATION that is the property of
 * create3000.
 *
 * No permission is granted to copy, distribute, or create derivative works from
 * the contents of this software, in whole or in part, without the prior written
 * permission of create3000.
 *
 * NON-MILITARY USE ONLY
 *
 * All create3000 software are effectively free software with a non-military use
 * restriction. It is free. Well commented source is provided. You may reuse the
 * source in any way you please with the exception anything that uses it must be
 * marked to indicate is contains 'non-military use only' components.
 *
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * Copyright 2015, 2016 Holger Seelig <holger.seelig@yahoo.de>.
 *
 * This file is part of the Cobweb Project.
 *
 * Cobweb is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License version 3 only, as published by the
 * Free Software Foundation.
 *
 * Cobweb is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License version 3 for more
 * details (a copy is included in the LICENSE file that accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version 3
 * along with Cobweb.  If not, see <http://www.gnu.org/licenses/gpl.html> for a
 * copy of the GPLv3 License.
 *
 * For Silvio, Joy and Adi.
 *
 ******************************************************************************/


define ([
	"jquery",
	"cobweb/Fields/SFNode",
	"cobweb/Basic/X3DBaseNode",
	"cobweb/Components/Layering/LayerSet",
	"cobweb/Components/Layering/Layer",
	"cobweb/Bits/X3DCast",
	"cobweb/Bits/X3DConstants",
],
function ($,
          SFNode,
          X3DBaseNode,
          LayerSet,
          Layer,
          X3DCast,
          X3DConstants)
{
"use strict";

	function World (executionContext)
	{
		X3DBaseNode .call (this, executionContext);

		this .layerSet        = new LayerSet (executionContext);
		this .defaultLayerSet = this .layerSet;
		this .layer0          = new Layer (executionContext);
		
		this .addChildren ("activeLayer", new SFNode (this .layer0));
	}

	World .prototype = $.extend (Object .create (X3DBaseNode .prototype),
	{
		constructor: World,
		getTypeName: function ()
		{
			return "World";
		},
		initialize: function ()
		{
			X3DBaseNode .prototype .initialize .call (this);

			this .layerSet .setup ();
			this .layerSet .setLayer0 (this .layer0);
			this .layerSet .activeLayer_ .addInterest (this, "set_activeLayer");

			this .getExecutionContext () .getRootNodes () .addInterest (this, "set_rootNodes");
			this .getExecutionContext () .setup ();

			this .set_rootNodes ();

			this .layer0 .isLayer0 (true);
			this .layer0 .setup ();

			this .bind ();
		},
		getLayerSet: function ()
		{
			return this .layerSet;
		},
		getActiveLayer: function ()
		{
			return this .activeLayer_ .getValue ();
		},
		set_rootNodes: function ()
		{
			var oldLayerSet = this .layerSet;
			this .layerSet  = this .defaultLayerSet;

			var rootNodes = this .getExecutionContext () .getRootNodes ();

			this .layer0 .children_ = rootNodes;

			for (var i = 0; i < rootNodes .length; ++ i)
			{
				var rootLayerSet = X3DCast (X3DConstants .LayerSet, rootNodes [i]);

				if (rootLayerSet)
				{
					rootLayerSet .setLayer0 (this .layer0);
					this .layerSet = rootLayerSet;
				}
			}

			if (this .layerSet !== oldLayerSet)
			{
				oldLayerSet    .activeLayer_ .removeInterest (this, "set_activeLayer");
				this .layerSet .activeLayer_ .addInterest    (this, "set_activeLayer");

				this .set_activeLayer ();
			}

			this .traverse = this .layerSet .traverse .bind (this .layerSet);
		},
		set_activeLayer: function ()
		{
			this .activeLayer_ = this .layerSet .getActiveLayer ();
		},
		bind: function ()
		{
			// Bind first X3DBindableNodes found in each layer.

			this .layerSet .bind ();

			// Bind viewpoint from URL.

			try
			{
				var fragment = this .getExecutionContext () .getURL () .fragment;

				if (fragment .length)
					this .getExecutionContext () .changeViewpoint (fragment);
			}
			catch (error)
			{ }
		},
	});

	return World;
});
