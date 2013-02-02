# Syntax.js

This project is aimed at providing a syntax-highlighting system that is modular, hackable, and 
flexible.


## Syntax

The Syntax object contains the core functionality.

### Syntax(code, type)

The `code` parameter should be a HTML Element, or a string.

	If a HTML Element is passed in, its innerHTML is used to layout and highlight the content 
	according to any of the Element's relevant properties.

		The `justify` attribute can be used in a number of ways: set to "on" or with no value at 
		all, the content will be justified (see below); set to "off", the content will not be 
		justified.

		The `tab-size` attribute will be used to set the tab width of the content in equivalent 
		spaces, changing how any indented code will look after rendering.

		The `type` attribute will be used to decide which syntax highlighter to use to render the 
		content.

	If a string is passed in, it is used as the content. It will be justified and its tab-size 
	changed according to the defaults set (see below).

The `type` parameter is optional, and should be a string. If a string was passed in, and a 
corresponding renderer exists at the time of rendering, this renderer will be applied to the 
relevant code. If no type was passed in, then a `<code>` Element's `type` attribute will be 
used. If no `type` attribute exists, or the code passed in was a string, then no renderer will 
be used to syntax highlight the code at all.

### Syntax defaults

`Syntax.justify` is a boolean, with an initial value of `true`. When a `<code>` HTML Element 
does not have a `justify` attribute, this value will be used. If true, any code passed in as a 
string will be justified (see below).

`Syntax.tabSize` is a number, with an initial value of 4. When a `<code>` HTML Element does not 
have a `tab-size` attribute, this value will be used. Any code passed in as a string will use 
this value to set it's tabs to the right width (see below).

### Justification

A `<code>` Element's content may have extra indenting, and may start or end on a new line. This 
can be because the code was inserted manually, and made to look nice in the HTML source, or 
a CMS of some kind may have been used to render the HTML, and therefore may render it strangley 
in some circumstances.

```html
<code>
	line 1
		indented line 2
	line 3
</code>
```

The code above, for example, has an extra new line at the beginning and end of the content, and 
the content itself has an unneeded indent to make it easier to read when looking at the source.

This can be very tricky to fix with CSS alone, however, and fixing this problem by manipulating 
the code in some way before-hand isn't ideal. When code is justified using Syntax.js, the 
content is changed to make it behave nicely on the page.

### Tab Size

*[IDE]: Integrated Development Environment; generally an application for writing code

Most IDEs give an option for setting the width of an indent or tab. This option usually allows 
the user to set how many equivalent spaces each tab should be. There is a CSS property that 
can let you do the same on any given element, but some browsers require vendor prefixes, and 
some do not support the feature at all.

When rendering code for a `<code>` Element, and the CSS feature is supported by the browser, 
the HTML Element's style will be set to use the specified tab-size for it's content. If the 
browser doesn't support the CSS property, all tabs will be converted into the specifies number 
of spaces, giving the same result for all browsers.

	If the `tab-size` attribute on the `<code>` Element has a value that is not a number, and 
	not the string "on", no tab sizing effect will be applied to the Element's content.

When rendering code for a code string spaces will always be used, as there is no HTML Element to 
set the style on. You can, however, apply individual pieces of the Syntax.js functionality to 
any given code, so if you do not want to convert the tabs into spaces, you can apply just the 
justification and rendering methods to the code in question (see below).

### Rendering

If the code is to be rendered using a specified type (see above), and a corresponding renderer 
exists at the time it should be rendered, the renderer will be applied to the code in question.

### Scheduling

The rendering of code into a syntax highlighted form can be heavy-duty work, and therefore could 
hold up the rendering of the layout (justification and tab-sizing) steps. For this reason, when 
some code would undergo layout and rendering changes, the layout is processed immediately, and 
the rendering is sheduled for soon after.

By shceduling this heavier work as a separate event, the page should render the layout changes 
to the screen immediately, giving a minimum of "popin". Then (in most cases) all that will 
happen when rendering the syntax highlighting step will be that the code text changes colour, 
etc., giving a nicer experience for the user.

## Methods

**TODO**
