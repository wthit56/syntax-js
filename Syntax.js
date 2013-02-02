if (!window.Syntax) {
	window.Syntax = (function () {
		var all = (function () {
			return function all(codes, action) {
				if (codes == null) { codes = document.getElementsByTagName("CODE"); }

				i = 0, l = codes.length;
				while (i < l) {
					action(codes[i]);
					i++;
				}
			};
		})();

		var tabSize = (function () {
			var s = document.body.style;
			if ("tabSize" in s) { return "tabSize"; }
			else if ("OTabSize" in s) { return "OTabSize"; }
			else if ("MozTabSize" in s) { return "MozTabSize"; }
			else { return null; }
		})();

		var unescapeHTML = (function () {
			var find = /(&lt;)|(&gt;)|(&amp;)|(&nbsp;)/g,
				replace = function (match, lt, gt, amp) {
					if (lt) { return "<"; }
					else if (gt) { return ">"; }
					else if (amp) { return "&"; }
					else if (nbsp) { return " "; }
				};

			return function unescapeHTML(input) {
				return input.replace(find, replace);
			};
		})();

		function queueRenderJob(codeElement, type) {
			return setTimeout(function () {
				Syntax.render(codeElement, type);
			}, 0);
		}

		var Syntax = (function () {
			var spaces, type, newCode;
			var codeType;

			function Syntax(code, type) {
				codeType = typeof (code);

				if ((codeType === "object") && (code.getAttribute)) {
					if (code.getAttribute) {
						Syntax.layout(code);
						queueRenderJob(code, type);
						return;
					}
				}
				else if (codeType === "string") {
					if (Syntax.justify) { code = Syntax.layout.justify(code); }
					if (Syntax.tabSize != null) { code = Syntax.layout.tabSize(code); }

					if (type != null) {
						return Syntax.render.string(code, type);
					}
					else { return code; }
				}
				else {
					throw new TypeError("Parameter 'code' must be a HTML Element or a string.");
				}
			};
			Syntax.all = function (codes) { return all(codes, Syntax); }

			return Syntax;
		})();

		Syntax.layout = (function () {
			var newCode, justify, spaces;

			function Syntax_layout(codeElement) {
				newCode = codeElement.innerHTML;

				justify = codeElement.getAttribute("justify");
				console.log(justify, Syntax.justify);
				if (
					((justify == null) && Syntax.justify)
					|| ((justify != null) && (justify != "off"))
				) {
					newCode = Syntax.layout.justify(newCode);
				}

				spaces = codeElement.getAttribute("tab-size");
				if ((spaces == null) || (spaces === "on")) { spaces = Syntax.tabSize; }
				else if (!isNaN(spaces)) { spaces = +spaces; }
				else { spaces = null; }

				if (spaces != null) {
					if (tabSize != null) {
						codeElement.style[tabSize] = spaces;
					}
					else {
						newCode = Syntax.layout.tabSize(newCode, spaces);
					}
				}

				codeElement.innerHTML = newCode;
				newCode = "";
			};

			Syntax_layout.justify = (function () {
				var find = /^[^\S\t]*|\s*$/g, replace = "";
				var indent, tabs,
					findIndent = /^\t+(?=\S)/gm, indentFind;

				return function Syntax_justify(code) {
					code = code.replace(find, replace);

					indent = Infinity;
					tabs = findIndent.exec(code);
					while (tabs) {
						if (tabs[0].length < indent) {
							indent = tabs[0].length;
						}
						tabs = findIndent.exec(code);
					}

					if (indent != Infinity) {
						indentFind = new RegExp("^\\t{" + indent + "}", "gm");
						code = code.replace(indentFind, replace);
					}

					return code;
				};
			})();
			Syntax_layout.tabSize = (function () {
				var space = " ", spaces = "    ",
					find = /\t/g;

				return function Syntax_tabSize(code, tabSize) {
					if (tabSize == null) { tabSize = Syntax.tabSize; }
					if (tabSize < 0) { tabSize = 0; }
					if (spaces.length != tabSize) {
						spaces = new Array(tabSize + 1).join(space);
					}

					return code.replace(find, spaces);
				};
			})();

			Syntax_layout.all = function (codes) {
				return all(codes, Syntax_layout);
			};

			return Syntax_layout;
		})();

		Syntax.render = (function () {
			var type;

			function render(codeElement, type) {
				type = type || codeElement.getAttribute("type");
				codeElement.innerHTML = render.string(unescapeHTML(codeElement.innerHTML), type);
			};
			render.string = function (code, type) {
				if ((type != null) && (typeof (Syntax[type]) === "function")) {
					return Syntax[type](code);
				}
				else { return code; }
			};
			render.all = function (codes) {
				all(codes, render);
			};

			return render;
		})();

		Syntax.justify = false;
		Syntax.tabSize = null;

		return Syntax;
	})();
}