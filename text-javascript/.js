// requirements
if (!window.Replacer) { throw new Error("Replacer required"); }

if (!window.Syntax) { window.Syntax = {}; }

window.Syntax["text/javascript"] = (function () {

	var part = new String("<span class=\"{class}\">{content}</span>");
	part.open = new String("<span class=\"{class}\">");
	part.close = new String("</span>");

	var Text = (function () {
		var entities = {
			"<": "&lt;",
			">": "&gt;"
		};

		var render = Replacer(/<|>/g, function (match) { return entities[match]; });

		return function Text(code) {
			return render(code);
		};
	})();

	return Replacer.aggregate(
		{ // string
			find: /("|')((?:[\W\w]*?(?:\\\1)?)*?)(\1)/,
			replace: (function () {
				var template = new String(
					part.replace("{class}", "string").replace("{content}",
						part.replace("{class}", "string left").replace("{content}", "{left}") +
						part.replace("{class}", "string content").replace("{content}", "{content}") +
						part.replace("{class}", "string right").replace("{content}", "{right}")
					)
				);

				return function (match, left, content, right) {
					return template.replace("{left}", left).replace("{content}", content).replace("{right}", Text(right));
				};
			})()
		},

		{ // comment
			find: /((\/\/)([^\r\n]*))|((\/\*)((?:\n|.)*?)(\*\/))/,
			replace: (function () {
				var templates = {
					single: part.replace("{class}", "comment single-line").replace("{content}",
						part.replace("{class}", "comment left").replace("{content}", "{left}") +
						part.replace("{class}", "comment content")
					),
					multi: part.replace("{class}", "comment multi-line").replace("{content}",
						part.replace("{class}", "comment left").replace("{content}", "{left}") +
						part.replace("{class}", "comment content") +
						part.replace("{class}", "comment right").replace("{content}", "{right}")
					)
				};

				return function (
					match,
					is_single, single_left, single_content,
					is_multi, multi_left, multi_content, multi_right
				) {
					if (is_single) {
						return templates.single.replace("{left}", single_left).replace("{content}", Text(single_content));
					}
					else if (is_multi) {
						return templates.multi.replace("{left}", multi_left).replace("{content}", multi_content).replace("{right}", Text(multi_right));
					}
				};
			})()
		},

		Replacer.aggregate( // number
			{ // hexadecimal
			find: /(0x)([0-9a-fA-F]+)/,
			replace: function (match, left, integer) {
				return part.replace("{class}", "number integer hexadecimal").replace("{content}",
						part.replace("{class}", "number hexadecimal left").replace("{content}", left) +
						part.replace("{class}", "number hexadecimal integer\" title=\"Hexadecimal Value: " + left + integer + " = " + parseInt(left + integer, 16).toString()).replace("{content}", integer)
					);
			}
		},
			{ // possible-octal
				find: /(0)(\d+)((\.)(\d*))?/,
				replace: function (match, left, integer, decimal, point, fraction) {
					if (!decimal) {
						return part.replace("{class}", "number integer possible-octal").replace("{content}",
							part.replace("{class}", "number possible-octal left").replace("{content}", left) +
							part.replace("{class}", "number possible-octal integer\" title=\"Possible Octal Value: " + left + integer + " = " + parseInt(left + integer, 8).toString()).replace("{content}", integer)
						);
					}
					else {
						return part.replace("{class}", "number integer decimal possible-octal").replace("{content}",
							part.replace("{class}", "number possible-octal left").replace("{content}", left) +
							part.replace("{class}", "number possible-octal integer\" title=\"Possible Octal Value: " + left + integer + " = " + parseInt(left + integer, 8).toString()).replace("{content}", integer) +
							part.replace("{class}", "number decimal point").replace("{content}", point) +
							part.replace("{class}", "number decimal fraction").replace("{content}", fraction)
						);
					}
				}
			},
			{ // number
				find: /(\d+)((\.)(\d*))/,
				replace: function (match, integer, decimal, point, fraction) {
					if (!decimal) {
						return part.replace("{class}", "number integer").replace("{content}", integer);
					}
					else {
						return part.replace("{class}", "number integer decimal").replace("{content}",
							part.replace("{class}", "number integer").replace("{content}", integer) +
							part.replace("{class}", "number decimal point").replace("{content}", point) +
							part.replace("{class}", "number decimal fraction").replace("{content}", fraction)
						);
					}
				}
			},

			{ // numbers (hex, integer, decimal)
				find: /(0x)|(\d+)((\.)(\d*))?/,
				replace: function (match, hex, integer, decimal, point, fraction) {
					if (hex) {
						return part.replace("{class}", "number hexadecimal").replace("{content}",
							part.replace("{class}", "number hexadecimal left").replace("{content}", hex) +
							part.replace("{class}", "number hexadecimal value").replace("{content}", integer)
						);
					}
					else if (decimal) {
						return part.replace("{class}", "number decimal").replace("{content}",
							part.replace("{class}", "number decimal integer").replace("{content}", integer) +
							part.replace("{class}", "number decimal point").replace("{content}", point) +
							part.replace("{class}", "number decimal fraction").replace("{content}", fraction)
						);
					}
					else {
						return part.replace("{class}", "number integer")
							.replace("{content}", integer);
					}
				}
			},
			{ // Infinity
				find: /Infinity/,
				replace: function (match) {
					return part.replace("{class}", "number keyword infinity")
						.replace("{content}", match);
				}
			}
		),

		{ // regex
			find: /(\/)((?:\S*?\/?)*?)(\/)([gimy]{0,4})/,
			replace: function (match, left, pattern, right, flags) {
				return part.replace("{class}", "regexp short-hand").replace("{content}",
					part.replace("{class}", "regexp short-hand left").replace("{content}", left) +
					part.replace("{class}", "regexp short-hand pattern")
						.replace("{content}", Text(pattern)) +
					part.replace("{class}", "regexp short-hand left").replace("{content}", right) +
					part.replace("{class}", "regexp short-hand flags").replace("{content}", flags)
				);
			}
		},

		{ // keyword
			find: /\b(var|let|if|else if|else|while|do|for|return|in|instanceof|function|new|with|typeof|try|catch|finally|null|undefined|break|continue)\b/,
			replace: function (keyword) {
				return part.replace("{class}", "keyword " + keyword).replace("{content}", keyword);
			}
		},

		{ // boolean
			find: /\b(true|false)\b/,
			replace: function (boolean) {
				return part.replace("{class}", "boolean " + boolean).replace("{content}", boolean);
			}
		},

		(function () {
			var names = {
				"++": "increment",
				"--": "decrement",

				"+": "add",
				"-": "subtract",
				"*": "multiply",
				"/": "divide",
				"%": "modulus",

				"&": "and",
				"|": "or",
				"^": "xor",
				"~": "not",
				"<<": "shift-left",
				">>": "shift-right",
				">>>": "shift-right-zero-fill",

				"&&": "and",
				"||": "or",
				"!": "not",

				">": "greater-than",
				"<": "less-than",

				"=": "assign",

				"?": "conditional",
				":": "colon",
				",": "comma",

				";": "semi-colon"
			};

			function op_type(type) {
				return function (match) {
					return part.replace(
						"{class}",
						"operator" +
						(type ? " " + type : "") +
						" " + names[match]
					).replace("{content}", Text(match));
				};
			}

			function op_assignable(type) {
				return function (match, operator, assigning) {
					return part.replace(
						"{class}",
						"operator assignable" +
						" " + type +
						" " + names[operator] +
						(assigning ? " assignment" : "")
					).replace("{content}", Text(match));
				};
			}

			return Replacer.aggregate(
				{ // crement
					find: /\+\+|--/,
					replace: op_type("crement")
				},

				{ // logical
					find: /&&|\|\|/,
					replace: op_type("logical")
				},

				Replacer.aggregate( // assignable
					{ // arithmetic
					find: /(\+|-|\*|\/|%)(=)?/,
					replace: op_assignable("arithmetic")
				},
					{ // bitwise
						find: /(&|\||\^|~|<<|>>>|>>)(=)?/,
						replace: op_assignable("bitwise")
					}
				),

				Replacer.aggregate( // comparison
					{ // equality
					find: /(?:(!)|=)=(=)?/,
					replace: function (match, not, strict) {
						return part.replace(
								"{class}",
								"operator comparison equality" +
								(not ? " not-equal" : "") +
								(strict ? " strict" : "")
							).replace("{content}", match);
					}
				},
					{ // relative
						find: /(<|>)(=)?/,
						replace: function (match, than, or_equal_to) {
							return part.replace(
								"{class}",
								"operator comparison relative" +
								" " + (names[than]) +
								(or_equal_to ? " or-equal-to" : "")
							).replace("{content}", Text(match));
						}
					}
				),

				{ // assignment
					find: /=/,
					replace: function (match) {
						return part.replace("{class}", "operator assignment")
							.replace("{content}", match)
					}
				},

				{ // logical not
					find: /!/,
					replace: function (match) {
						return part.replace("{class}", "operator logical not")
							.replace("{content}", match);
					}
				},

				{ // other
					find: /[?;:,]/,
					replace: op_type("")
				}
			);
		})(),

		{ // dot property accessor
			find: /(\.(?=[\D\S_]))/,
			replace: function (match) {
				return part.replace("{class}", "property-accessor dot").replace("{content}", match);
			}
		},

		{ // square bracket
			find: /(\[)|(\])/,
			replace: (function () {
				var isArray = /[\s=(\[]/,
					isArrayNesting = [];

				return function (match, left, right, index, input) {
					if (left) {
						if ((index == 0) || (isArray.test(input[index - 1]))) {
							isArrayNesting.push(true);
							return part.open.replace("{class}", "short-hand array") +
								part.replace("{class}", "short-hand array left")
									.replace("{content}", match) +
								part.open.replace("{class}", "short-hand array content");
						}
						else {
							isArrayNesting.push(false);
							return part.open.replace("{class}", "property-accessor bracket") +
								part.replace("{class}", "property-accessor bracket left")
									.replace("{content}", match) +
								part.open.replace("{class}", "property-accessor bracket content");
						}
					}
					else if (right) {
						if (isArrayNesting.pop()) {
							return part.close +
								part.replace("{class}", "short-hand array right").replace("{content}", match) +
								part.close;
						}
						else {
							return part.close +
								part.replace("{class}", "property-accessor bracket right").replace("{content}", match) +
								part.close;
						}
					}

					return match;
				};
			})()
		},

		{ // curly brace
			find: /(\{)(?=[\W\w]*?(?:(:)|[;}?.]))|(\})/,
			replace: (function () {
				var type, typeNesting = [];

				return function (match, left, object, right) {
					if (left) {
						if (object) {
							type = "short-hand object";
							typeNesting.push(true);
						}
						else {
							typeNesting.push(false);
							type = "statement-block";
						}

						return part.open.replace("{class}", type) +
							part.replace("{class}", type + " left").replace("{content}", left);
					}
					else {
						if (typeNesting.pop()) {
							type = "short-hand object";
						}
						else {
							type = "statement-block";
						}

						return part.replace("{class}", type + " right").replace("{content}", right) +
							part.close;
					}


					return match;
				};
			})()
		},

		{ // parenthesis
			find: /(\()|(\))/,
			replace: function (match, left, right) {
				if (left) {
					return part.open.replace("{class}", "parentheses") +
						part.replace("{class}", "parentheses outer left").replace("{content}", match);
				}
				else if (right) {
					return part.replace("{class}", "parentheses outer right").replace("{content}", match) +
						part.close;
				}

				return match;
			}
		}
	);


	//{ // operator
	//	find: (function () {
	//		return new RegExp(
	//			"((" +
	//			[
	//				/=/.source, // assignment
	//				/((?:(!)|=)=(=)?)|((<|>)(=)?)/.source, // comparison
	//				/&&|\|\||!/.source, // logical
	//				/[\?:,]/.source // other
	//			].join(")|(") +
	//			"))",
	//		"g");
	//	//})(),
	//	replace: (function () {
	//		var names = {
	//		};
	//		var name;

	//		return function (
	//			match,
	//			operator,
	//			crement,
	//			assignable,
	//				arithmetic, bitwise,
	//				assigning,
	//			assignment,
	//			comparison,
	//				equality, not, strict,
	//				relative, than, or_equal_to,
	//			logical,
	//			other
	//		) {
	//			name = "operator";

	//			if (crement || logical) {
	//				if (crement) { name += " crement"; }
	//				else if (logical) { name += " logical"; }

	//				name += " " + names[crement || logical];
	//			}
	//			else if (comparison) {
	//				name += " comparison" + (
	//					equality ? (
	//							(not ? " not" : "") +
	//							(equality ? " equality" : "") +
	//							(strict ? " strict" : "")
	//					)
	//					: relative ? (
	//							" " + (names[than]) +
	//							(or_equal_to ? " or-equal-to" : "")
	//					)
	//					: ""
	//				);
	//			}
	//			else if (assignable) {
	//				if (arithmetic) { name += " arithmetic"; }
	//				else if (bitwise) { name += " bitwise"; }

	//				if (arithmetic || bitwise) { name += " " + names[arithmetic || bitwise]; }
	//				if (assigning) { name += " assigning"; }
	//			}
	//			else if (assignment) { name += " assignment"; }
	//			else if (other) {
	//				name += " " + names[other];
	//			}

	//			return part.replace("{class}", name).replace("{content}", operator);
	//		};
	//	})()
	//};
})();
