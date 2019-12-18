@echo off
set JSFILES= ..\source\codemirror.js ^
	..\source\codemirror-activeline.js ^
	..\source\codemirror-dialog.js ^
	..\source\codemirror-search.js ^
	..\source\codemirror-searchcursor.js ^
	..\source\codemirror-jumptoline.js ^
	..\source\codemirror-comment.js ^
	..\source\codemirror-scroll.js ^
	..\source\codemirror-unindent.js ^
	..\source\codemirror-tscriptmode.js ^
	..\source\tscript.js ^
	..\source\tgui.js ^
	..\source\interact.min.js ^
	..\source\ide.js ^
	..\source\search.js ^
	..\source\doc.js ^
	..\source\def-concepts.js ^
	..\source\def-ide.js ^
	..\source\def-language.js ^
	..\source\def-stdlib.js ^
	..\source\def-errors.js ^
	..\source\def-legal.js

set CSSFILES= ..\source\codemirror.css ^
	..\source\tgui.css ^
	..\source\ide.css ^
	..\source\documentation.css

@echo on

del index.html
del index.html.zip
@pause

type start %JSFILES% middle %CSSFILES% end > index.html
::zip index.html.zip index.html
@pause