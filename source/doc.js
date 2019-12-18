"use strict"

///////////////////////////////////////////////////////////
// TScript documentation
//

let doc = (function() {
if (window.location.search != "?doc") return null;

document.title = "TScript Documentation";

// define the central documentation data object, to be extended in other files
let module = { "id": "", "name": "TScript Documentation", "title": "TScript Documentation", "children": [], "content":
`
<p>
Welcome to TScript!
</p>
<p>
TScript (&quot;teaching-script&quot;) is a programming language created
specifically for programming beginners. Its clean design yields a smooth
learning experience. It offers simple graphics manipulation
environments, which greatly boost motivation and stimulate a playful and
explorative learning style.
</p>

<h2>Overview</h2>
<p>
Being a reference documentation, this collection of documents is not
designed for being read front to end, but rather as a resource for
looking up information. However, the section
<a href="#/concepts">core concepts</a> is a good starting point for
programmers experienced with other programming languages.
</p>
`
};

let docpath = "";
let doctree = null;


// This function copies #text to the clipboard when run
// from within an event handler.
function toClipboard(text)
{
	// dummy text area
	let textarea = document.createElement("textarea");
	textarea.value = text;
	document.body.appendChild(textarea);
	textarea.focus();
	textarea.select();

	try
	{
		// actual copy
		document.execCommand('copy');
	}
	catch (err)
	{
		// ignore
	}

	// cleanup
	document.body.removeChild(textarea);
}

function docinfo(value, node_id)
{
	let ret = { "children": [], "ids": [] };

	if (value === null)
	{
		ret.children.push(doc);
		ret.ids.push("");
	}
	else
	{
		ret.opened = (node_id.split("/").length <= 2) || (docpath.substr(0, node_id.length) == node_id);
		for (var i=0; i<value.children.length; i++)
		{
			ret.children.push(value.children[i]);
			ret.ids.push(node_id + "/" + value.children[i].id);
		}
		ret.element = tgui.createElement({"type": "span"});
		tgui.createElement({
				"type": "span",
				"parent": ret.element,
				"classname": (node_id == docpath ? "entry current" : "entry"),
				"text": value.name,
			});
	}

	return ret;
}

// tokenizer for EBNF, compatible with the lexer interface
let get_token_ebnf = function(state)
{
	let c = state.current();
	if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || c == '_')
	{
		// parse an identifier or a keyword
		state.advance();
		while (state.good())
		{
			let c = state.current();
			if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c == '_' || c == '-') state.advance();
			else break;
		}
		return { "type": "identifier" };
	}
	else if (c == '\"')
	{
		// parse string literal
		state.advance();
		while (true)
		{
			if (! state.good()) state.error("syntax error in string literal; closing double quotes '\"' expected");
			let c = state.current();
			if (c == '\r' || c == '\n') state.error("syntax error in string literal; closing double quotes '\"' expected before end-of-line");
			else if (c == '\"')
			{
				state.advance();
				break;
			}
			else state.advance();
		}
		return { "type": "literal" };
	}
	else if (c == '\'')
	{
		// parse string literal
		state.advance();
		while (true)
		{
			if (! state.good()) state.error("syntax error in string literal; closing single quotes ' expected");
			let c = state.current();
			if (c == '\r' || c == '\n') state.error("syntax error in string literal; closing double quotes '\"' expected before end-of-line");
			else if (c == '\'')
			{
				state.advance();
				break;
			}
			else state.advance();
		}
		return { "type": "literal" };
	}
	else if (c == '$')
	{
		// parse special
		state.advance();
		while (true)
		{
			if (! state.good()) state.error("syntax error in special; closing dollar sigh '$' expected");
			let c = state.current();
			state.advance();
			if (c == '$') break;
		}
		return { "type": "special" };
	}
	else
	{
		// all the rest, including operators
		state.advance();
		if ("=-*|".indexOf(c) >= 0) return { "type": "operator" };
		if ("()[]{}".indexOf(c) >= 0) return { "type": "grouping" };
		if (";".indexOf(c) >= 0) return { "type": "delimiter" };
		state.error("EBNF syntax error; invalid character '" + c + "'");
	}
}

let get_token_code = function(state)
{
	if (state.current() == '#')
	{
		state.advance();
		if (state.current() == '*')
		{
			state.advance();
			while ((state.current() != '*' || state.next() != '#') && state.current() != "") state.advance();
			state.advance(2);
			return { "type": "comment" };
		}
		else
		{
			while (state.current() != '\n' && state.current() != "") state.advance();
			state.advance();
			return { "type": "comment" };
		}
	}
	else
	{
		let ret = TScript.get_token(state, true);
		state.advance(ret.code.length);
		return ret;
	}
}

function processCode(code, css_prefix, lex)
{
	const white = " \t\r";
	if (code.indexOf('\n') >= 0)
	{
		// multiple lines: find shared indentation
		let lines = code.split('\n');
		let indent = "";
		let maxlength = 1000000;
		for (let i=0; i<lines.length; i++)
		{
			let line = lines[i];
			if (maxlength >= 1000000)
			{
				for (let j=0; j<line.length; j++)
				{
					if (white.indexOf(line[j]) < 0)
					{
						indent = line.substr(0, j);
						maxlength = j;
						break;
					}
				}
			}
			else
			{
				for (let j=0; j<line.length; j++)
				{
					if (j >= maxlength) break;
					if (indent[j] != line[j])
					{
						maxlength = j;
						indent = indent.substr(0, maxlength);
						break;
					}
				}
			}
		}

		// encode lines individually
		let ret = "<div class=\"" + css_prefix + "\"><pre class=\"" + css_prefix + "\">";
		for (let i=0; i<lines.length; i++)
		{
			let line = lines[i];
			if (i == 0 && line.length <= indent.length) continue;
			if (line.length > indent.length) ret += processCode(line.substr(indent.length), css_prefix, lex);
			ret += '\n';
		}
		while (ret.length > 0 && ret[ret.length-1] == '\n') ret = ret.substr(0, ret.length - 1);
		ret += "</pre></div>";
		return ret;
	}
	else
	{
		// single line
		let state = {
				"source": code,
				"pos": 0,               // zero-based position in the source code string
				"good": function()
						{ return (this.pos < this.source.length); },
				"bad": function()
						{ return (! this.good()); },
				"eof": function()
						{ return this.pos >= this.source.length; },
				"indentation": function()
						{ return 0; },
				"error": function(path, args)
						{
							if (args === undefined) args = [];
							let str = "documentation internal error in code: '" + this.source + "'";
							console.log(str);
							console.log(path, args);
							throw new Error(str);
						},
				"current": function()
						{ return (this.pos >= this.source.length) ? "" : this.source[this.pos]; },
				"lookahead": function(num)
						{ return (this.pos + num >= this.source.length) ? "" : this.source[this.pos + num]; },
				"next": function()
						{ return this.lookahead(1); },
				"get": function()
						{ return { "pos": this.pos, "line": this.line, "ch": this.ch }; },
				"set": function(where)
						{ this.pos = where.pos; this.line = where.line, this.ch = where.ch },
				"advance": function(n)
						{
							if (n === undefined) n = 1;
							if (this.pos + n > this.source.length) n = this.source.length - this.pos;
							for (let i=0; i<n; i++)
							{
								let c = this.current();
								if (c == '\n') { this.line++; this.ch = 0; }
								this.pos++; this.ch++;
							}
						},
				"skip": function()
						{
							while (this.good())
							{
								let c = this.current();
								if (c == '#')
								{
									this.pos++; this.ch++;
									if (this.current() == '*')
									{
										this.pos++; this.ch++;
										let star = false;
										while (this.good())
										{
											if (this.current() == '\n')
											{
												this.pos++;
												this.line++; this.ch = 0;
												star = false;
												continue;
											}
											if (star && this.current() == '#')
											{
												this.pos++; this.ch++;
												break;
											}
											star = (this.current() == '*');
											this.pos++; this.ch++;
										}
									}
									else
									{
										while (this.good() && this.current() != '\n') { this.pos++; this.ch++; }
									}
									continue;
								}
								if (c != ' ' && c != '\t' && c != '\r' && c != '\n') break;
								if (c == '\n') { this.line++; this.ch = 0; }
								else this.ch++;
								this.pos++;
							}
						},
			};

		let ret = "<code class=\"" + css_prefix + "\">";
		while (! state.eof())
		{
			while (state.good())
			{
				let c = state.current();
				if (white.indexOf(c) < 0) break;
				if (c == ' ') ret += c;
				else if (c == '\t') ret += "    ";
				else if (c == '\r') { }
				state.advance();
			}
			if (state.eof()) break;
			let start = state.pos;
			let token = lex(state);
			let value = code.substr(start, state.pos - start);
			ret += "<span class=\"" + css_prefix + "-" + token.type + "\">" + value + "</span>";
		}
		ret += "</code>";
		return ret;
	}
}

// Check code for correctness by parsing and running it.
// On success, the function does nothing, otherwise is throws an error message.
function checkCode(code)
{
	let result = TScript.parse(code);
	if (result.hasOwnProperty("errors") && result.errors.length > 0) throw result.errors[0].message;
	let interpreter = new TScript.Interpreter(result.program);
	interpreter.reset();
	interpreter.service.message = function(msg) { throw msg; }
	interpreter.service.documentation_mode = true;
	while (interpreter.status == "running" || interpreter.status == "waiting") interpreter.exec_step();
	if (interpreter.status != "finished") alert("code sample failed to run:\n" + code);
}

// This function returns an altered version of the pseudo-html #content
// suitable for placing it as innerHTML into the DOM. It performs a
// number of stylistic replacements:
// * It scans for the ebnf tag and adds proper syntax highlighting.
// * It scans for the tscript tag and adds proper syntax highlighting.
//   As an additional sanity check, it parses and executes the code.
// * For the above tags, it removes leading empty lines, removes leading
//   indentation, and converts the remaining leading tabulators to four
//   spaces each.
// * It scans for keyword tags, which are styled appropriately.
function prepare(content)
{
	let search = content.toLowerCase();
	let ret = "";
	let start = 0;
	while (start < content.length)
	{
		let pos = search.indexOf('<', start);
		if (pos < 0)
		{
			ret += content.substr(start);
			break;
		}
		ret += content.substr(start, pos - start);
		start = pos;
		if (search.substr(start, 6) == "<ebnf>")
		{
			start += 6;
			let end = search.indexOf("</ebnf>", start);
			if (end < 0) throw "[doc] <ebnf> tag not closed";
			let ebnf = content.substr(start, end - start);
			start = end + 7;
			ret += processCode(ebnf, "ebnf", get_token_ebnf);
		}
		else if (search.substr(start, 9) == "<tscript>")
		{
			start += 9;
			let end = search.indexOf("</tscript>", start);
			if (end < 0) throw "[doc] <tscript> tag not closed";
			let code = content.substr(start, end - start);
			start = end + 10;
			checkCode(code);
			ret += processCode(code, "code", get_token_code);
		}
		else if (search.substr(start, 9) == "<keyword>")
		{
			start += 9;
			let end = search.indexOf("</keyword>", start);
			if (end < 0) throw "[doc] <keyword> tag not closed";
			let kw = content.substr(start, end - start);
			start = end + 10;
			ret += "<span class=\"keyword\">" + kw + "</span>";
		}
		else
		{
			ret += content[start];
			start++;
		}
	}
	return ret;
}

// This function returns an altered version of the pseudo-html #content
// suitable for searching. It removes all tags, as well as the contents
// of ebnf and tscript tags.
function plaintext(content)
{
	let search = content.toLowerCase();
	let ret = "";
	let start = 0;
	while (start < content.length)
	{
		let pos = search.indexOf('<', start);
		if (pos < 0)
		{
			ret += content.substr(start);
			break;
		}
		ret += content.substr(start, pos - start);
		start = pos;
		if (search.substr(start, 6) == "<ebnf>")
		{
			start += 6;
			let end = search.indexOf("</ebnf>", start);
			if (end < 0) throw "[doc] <ebnf> tag not closed";
			start = end + 7;
			ret += " ";
		}
		else if (search.substr(start, 10) == "<tscript>")
		{
			start += 10;
			let end = search.indexOf("</tscript>", start);
			if (end < 0) throw "[doc] <tscript> tag not closed";
			start = end + 11;
			ret += " ";
		}
		else if (search.substr(start, 4) == "<h1>")
		{
			start += 4;
			let end = search.indexOf("</h1>", start);
			if (end < 0) throw "[doc] <h1> tag not closed";
			let s = content.substr(start, end - start) + " ";
			start = end + 5;
			ret += s;
			ret += s;
			ret += s;
			ret += s;
			ret += s;
		}
		else if (search.substr(start, 4) == "<h2>")
		{
			start += 4;
			let end = search.indexOf("</h2>", start);
			if (end < 0) throw "[doc] <h2> tag not closed";
			let s = content.substr(start, end - start) + " ";
			start = end + 5;
			ret += s;
			ret += s;
			ret += s;
		}
		else if (search.substr(start, 4) == "<h3>")
		{
			start += 4;
			let end = search.indexOf("</h3>", start);
			if (end < 0) throw "[doc] <h3> tag not closed";
			let s = content.substr(start, end - start) + " ";
			start = end + 5;
			ret += s;
			ret += s;
		}
		else
		{
			let end = content.indexOf('>', start+1);
			if (end < 0) throw "[doc] tag not closed";
			start = end+1;
			ret += " ";
		}
	}
	return ret;
}

function getnode(path)
{
	let tokens = path.split("/");
	if (tokens[0] != "") throw "invalid path: " + path;
	let parent = null;
	let parentpath = null;
	let index = -1;
	let node = doc;
	for (let i=1; i<tokens.length; i++)
	{
		if (! node.hasOwnProperty("children")) throw "invalid path: " + path;
		let ch = node.children;
		let found = null;
		for (let j=0; j<ch.length; j++)
		{
			if (ch[j].id == tokens[i])
			{
				parent = node;
				parentpath = (parent == doc) ? "" : parentpath + "/" + parent.id;
				index = j;
				found = ch[j];
				break;
			}
		}
		if (found === null) throw "invalid path: " + path;
		node = found;
	}
	return [node, parent, parentpath, index];
}

function setpath(path)
{
	if (path.substr(0, 7) == "search/")
	{
		// prepare the search results page
		let keys = path.substr(7).split('/');
		let html = "<h2>Search Results for <i>&quot;";
		for (let i=0; i<keys.length; i++)
		{
			if (i != 0) html += " ";
			html += keys[i];
		}
		html += "&quot;</i></h2>";
		let results = searchengine.find(keys);
		if (results.length > 0)
		{
			html += "<ul>";
			for (let i=0; i<results.length; i++)
			{
				let path = results[i].id;
				let node = getnode(path)[0];
				html += "<li><a href=\"#" + path + "\">" + node.title + "</a><div class=\"searchresults\">terms:<i>";
				// sort words by relevance
				let words = [];
				for (let word in results[i].matches)
				{
					if (! results[i].matches.hasOwnProperty(word)) continue;
					words.push([word, results[i].matches[word]]);
				}
				words.sort(function(lhs, rhs){ return rhs[1] - lhs[1]; });
				for (let i=0; i<words.length; i++)
				{
					html += " " + words[i][0];
				}
				html += "</i></div></li>";
			}
			html += "</ul>";
		}
		else
		{
			html += "<p>sorry, no results found</p>";
		}

		// display the page
		let content = document.getElementById("content");
		content.innerHTML = html;
		content.scrollTop = 0;
		docpath = "";
		doctree.update(docinfo);
	}
	else
	{
		try
		{
			let data = getnode(path);
			let node = data[0];
			let parent = data[1];
			let parentpath = data[2];
			let index = data[3];
			let html = "<h1>" + node.title + "</h1>\n";
			if (node.hasOwnProperty("content")) html += node.content + "\n";
			if (node.hasOwnProperty("children"))
			{
				html += "<div class=\"related\">\n";
				html += "<h2>Related Topics</h2>\n<ul>\n";
				if (parent)
				{
					html += "back to enclosing topic: <a href=\"#" + parentpath + "\">" + parent.name + "<a><br/>\n";
					if (index > 0)
					{
						let sibling = parent.children[index - 1];
						html += "previous topic: <a href=\"#" + parentpath + "/" + sibling.id + "\">" + sibling.name + "<a><br/>\n";
					}
					if (index + 1 < parent.children.length)
					{
						let sibling = parent.children[index + 1];
						html += "next topic: <a href=\"#" + parentpath + "/" + sibling.id + "\">" + sibling.name + "<a><br/>\n";
					}
				}
				if (node.children.length > 0)
				{
					html += "<h3>Subordinate Topics</h3>\n<ul>\n";
					for (let i=0; i<node.children.length; i++) html += "<li><a href=\"#" + path + "/" + node.children[i].id + "\">" + node.children[i].name + "</a></li>\n";
					html += "</ul>\n";
				}
				html += "</div>\n";
			}
			html += "<div class=\"pad\"></div>\n";
			let content = document.getElementById("content");

			content.innerHTML = prepare(html);
			content.scrollTop = 0;
			docpath = path;
			doctree.update(docinfo);

			let pres = document.getElementsByTagName("pre");
			for (let i=0; i<pres.length; i++)
			{
				let pre = pres[i];
				if (pre.className.indexOf("code") >= 0)
				{
					let c = pre.textContent + "\n";
					pre.parentNode.addEventListener("click", function(event) { toClipboard(c); });
				}
			}
		}
		catch (ex)
		{
			if (ex.message) alert(ex.message);
			else alert(ex);
			throw ex;
		}
	}
}

function initsearch(path, node)
{
	let s = plaintext("<h1>" + node.title + "</h1>\n" + node.content);
	searchengine.add(path, s);
	for (let i=0; i<node.children.length; i++)
	{
		let c = node.children[i];
		initsearch(path + "/" + c.id, c);
	}
}

function checklinks(node, path)
{
	let start = 0;
	while (true)
	{
		let pos = node.content.indexOf("href=\"", start);
		if (pos < 0) break;
		start = pos + 6;
		pos = node.content.indexOf('\"', start);
		let s = node.content.substr(start, pos-start);
		start = pos + 1;
		if (s.length > 0 && s[0] == '#')
		{
			try
			{
				getnode(s.substr(1));
			}
			catch (ex)
			{
				// invalid link
				alert("[link checker] broken link to '" + s + "' in document '" + path + "'");
			}
		}
	}

	for (let i=0; i<node.children.length; i++) checklinks(node.children[i], path + "/" + node.children[i].id);
}

window.addEventListener("load", function()
{
	// create the framing html elements
	document.body.innerHTML =
		`
			<div id="doc-main">
			<div id="sidebar">
				<div id="version"></div>
				<div id="search"><input id="searchtext" type="text" placeholder="search" /></div>
				<div id="tree"></div>
			</div>

			<div id="content"></div>
			</div>
		`;

	// display the version
	let version = document.getElementById("version");
	version.innerHTML = TScript.version.full();
	version.addEventListener("click", function(event)
			{
				let base = window.location.href.split("#")[0];
				window.location.href = base + "#/legal";
				setpath("/legal");
 			});

	// prepare the error sub-tree of the documentation tree
	let rec = function(entry, path = "")
			{
				let placeholders = ["X", "Y", "Z", "W", "V"];
				if (! entry.hasOwnProperty("name"))
				{
					let tmpl = TScript.errorTemplate(path);
					let tokens = tmpl.split("$$");
					entry.name = tokens[0];
					for (let i=1; i<tokens.length; i++) entry.name += placeholders[i-1] + tokens[i];
				}
				if (! entry.hasOwnProperty("title")) entry.title = "Error Message: " + entry.name;
				for (let i=0; i<entry.children.length; i++)
				{
					rec(entry.children[i], path + "/" + entry.children[i].id);
				}
			};
	for (let i=0; i<doc.children.length; i++)
	{
		if (doc.children[i].id == "errors") rec(doc.children[i]);
	}

	// prepare the tree control
	doctree = tgui.createTreeControl({
			"parent": document.getElementById("tree"),
			"info": docinfo,
			"nodeclick": function(event, value, id)
					{
						let base = window.location.href.split("#")[0];
						window.location.href = base + "#" + id;
						setpath(id);
					},
		});

	// make the search field functional
	initsearch("", doc);   // index the docs
	let searchfield = document.getElementById("searchtext");
	searchfield.addEventListener("keypress", function(event)
	{
		if (event.key != "Enter") return;

		let keys = searchengine.tokenize(searchfield.value);
		let h = "#search";
		for (let i=0; i<keys.length; i++) h += "/" + keys[i];
		window.location.hash = h;
	});

	// check all internal links
	checklinks(doc, "#");

	// process the "anchor" part of the URL
	window.addEventListener("hashchange", function()
	{
		let path = window.location.hash;
		if (path.length > 0) path = path.substr(1);
		setpath(path);
	});
	let path = window.location.hash;
	if (path.length > 0) path = path.substr(1);
	setpath(path);
});

return module;
}());
