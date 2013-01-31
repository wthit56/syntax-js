# Syntax.js

This project is aimed at providing a syntax-highlighting system that is modular, hackable, and 
covers everything.

The JavaScript language definition, for example, will take any JavaScript string and insert 
spans around any and all tokens, including nested blocks, etc. This allows you to target any 
JavaScript operator or keyword, or a group of keywords. The classnames decorating your source 
code are also full and verbose, giving you the power to select any concieveable group of 
language features you wish to, or select specific parts of the language with fine-grain 
accuracy.

## Syntax.js (file)

This file is the main, basic functionality of the highlighter. When the page loads, it will 
loop through every `<code>` block on the page, cleaning up the general layout of the code itself 
before any actual syntax-highlighting takes place where necessary (see **justify** below).

The syntax-highlighting job itself is then scheduled to be run _after_ the clean-up step is 
complete. This means that the effects of the clean-up won't be held up waiting for the more 
heavy-duty highlighting step to finish up.

Alternatively, you can use the Syntax object to explicitly render some code. All you need to do 
is pass in the code to convert, and the "type" (or renderer name) to use to re-render it. This 
will then return the newly-rendered code for you to insert into your page or what have you.

Here's an example:

```js
var code = document.createElement("code");
code.innerHTML = Syntax("console.log(true);", "text/javascript");
document.body.appendChild(code);
```

> **NOTE:** You won't get any layout-fixing functionality if you explicitly use Syntax to 
> highlight code.

## Attributes

To configure how a block of code should be rendered, for layout and language selection, there 
are a few attributes attributes you can add to the `<code>` tag.

### type

The first and most important of these is the _type_ attribute. This will let the 
automatically-run Syntax renderer know which language the code should be highlighted as. So, if 
the code is written in JavaScript, give the `<code>` tag the attribute `type="text/javascript"`; 
just like a script or link tag.

> This can have any value that matches a renderer that has been loaded into the Syntax object. 
> If the value does not match a renderer, then the code in question will not be highlighted.

### justify

This attribute is referring to the code's layout, and if it should be tweaked to look it's best 
before syntax-highlighting. When included in a tag, any leading and trailing whitespace will be 
removed from the code. The overal indent of the code will also be removed.

For example:
```html
<code justify>
	if(true){
		console.log("justified");
	}
</code>
```
...would bcome:
```html
<code justify>if(true){
	console.log("justified");
}</code>
```

While this doesn't look so good once it's been "justified" like this, it fixes a few awkward 
layout problems that are very tricky to solve with CSS alone. This means if you're working with 
some framework that doesn't inject your code into the page while fixing such problems, or you 
just like to have your HTML source nicer to look at, you can just stick the _justify_ attribute 
on your `<code>` blocks and you'll be fine.

> This attribute does not have a value. Simply write your HTML like so: `<code justify>`.

### tab-spaces

Once your code has been "justified" (see above), your code should be much easier to look at. Now 
you can use the CSS `tab-size` property to set the tabs in your code blocks to be your preferred 
equivalent space-width. Unfortunately, older browsers, and even the latest IE it seems, does not 
support this property, even with a vendor prefix. So with just CSS you're pretty much stuck with 
the usual 8-space tab indents in your code.

If you add the _tab-spaces_ attribute to your `<code>` block, however, all this will be fixed. 
Ever tab found in your code will be turned into the specified number of "non-breaking spaces"
(&nbsp;, or just _spaces_ to the rest of us). This will ensure your tabs are displayed correctly 
no matter the browser's support for the CSS property.


## Creating your own Syntax-highlighter

To write your own syntax-highlighting for a given language, the process is very simple. First, 
write a function that takes a string (the original "source" code), and returns a string (the 
syntax-highlighting rendered version of the source). And then attach it directly to the Syntax 
object as a property named after the "type" name.

So for a JavaScript code renderer, simply write the following:

```js
Syntax["text/javascript"] = function (input){
	return "js-highlighting - " + input;
};
```

Now, when the Syntax object is used to highlight any code, it can use your new highlighter to 
render the code.

You'll probably want to do a check to make sure the Syntax object is there before writing to it:

```js
if(!window.Syntax){
	window.Syntax = { };
}
```

The beauty of this way of extending Syntax's functionality is that it is completely 
transferable, and doesn't necessarily need to be part of the Syntax library at all. You could 
even feasibly port any other highlighter (perhaps even a non-js one) to work with Syntax.js with 
minimal effort/re-writing. You could even take one of these renderers and use it on the 
server-side with node.js if you wish.


## TODOs

- Syntax.js shouldn't automatically do things onload; this should be configurable in some way
- Allow "justifying" code explicitly
- Allow using Syntax to explicitly render a given `<code>` tag
- Add comments to Syntax.js
