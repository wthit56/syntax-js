// console shim
(function () {
	if (!window.console) { window.console = {}; }
	if (!console.log) { console.log = function () { }; }
	if (!console.group) { console.group = function () { console.log(name); }; }
	if (!console.groupCollapsed) { console.groupCollapsed = console.group; }
	if (!console.groupEnd) { console.groupEnd = function () { }; }
})();

if (!window.Syntax) {
	window.Syntax = (function () {
		var removeIndent = (function () {
			var shortestIndent = -1, tabs = /^(\t*)\S/gm, match,
  				find = /[\w\W]*/g, replace = "";

			return function removeIndent() {
				shortestIndent = -1, tabs.lastIndex = 0;
				match = tabs.exec(this);
				while (match) {
					if ((shortestIndent < 0) || (shortestIndent > match[0].length)) {
						shortestIndent = match[1].length;
					}
					match = tabs.exec(this);
				}
				find = new RegExp("^\\t{" + shortestIndent + "}", "gm");
				return this.replace(find, replace);
				match = null;
			};
		})();

		var trimLines = (function () {
			var find = /^[^\S\t]*|\s*$/g, replace = "";

			return function trimLines() {
				return this.replace(find, replace);
			};
		})();

		var useSpaces = (function () {
			var find = /\t/g, replace = "    ";

			return function useSpaces(tabWidth) {
				if (tabWidth == null) { tabWidth = 4; }
				if (replace.length != tabWidth) { replace = new Array(tabWidth + 1).join(" "); }
				return this.replace(find, replace);
			};
		})();


		function Syntax(code, type) {
			return (Syntax[type])
				? Syntax[type](code)
				: code;
		}

		Syntax.renderAll = (function () {
			var codes, code = null, type, spaces,
				i, c, l;

			function align() {
				i = 0, l = codes.length;
				while (i < l) {
					c = codes[i];
					spaces = c.getAttribute("tab-width");

					if (c.getAttribute("justify") != null) {
						code = c.innerHTML;
						code = trimLines.call(code);
						code = removeIndent.call(code);
					}

					if (spaces) {
						code = code || c.innerHTML;
						code = useSpaces.call(code, +spaces);
					}

					if (code != null) { c.innerHTML = code; }

					code = null;

					i++;
				}
			}

			function render() {
				i = 0;
				while (i < l) {
					c = codes[i];
					type = codes[i].getAttribute("type");

					if (type) {
						c.innerHTML = Syntax(
							c.innerHTML
								.replace(/&lt;/g, "<")
								.replace(/&gt;/g, ">")
								.replace(/&amp;/g, "&"),
							type
						);
					}

					i++;
				}

				codes = null;
			}

			return function renderAll() {
				codes = document.getElementsByTagName("code");
				align();
				setTimeout(render, 0);
			};
		})();

		function load() { Syntax.renderAll(); }
		if (window.attachEvent) { window.attachEvent("load", load); }
		if (window.addEventListener) { window.addEventListener("load", load); }

		return Syntax;
	})();
}