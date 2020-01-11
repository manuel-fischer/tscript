# TScript
This is an extended implementation of the TScript ("teaching-script")
programming language.

It is based on the reference implementation by Tobias Glasmachers.
For more details click [here](https://github.com/TGlas/tscript) to get to the original repository.

## Additional features
* `Range.has(key)` (patch 0)
* `String.toUpperCase()` (patch 0)
* `String.toLowerCase()` (patch 0)
* Binary (prefix `0b`), octal (prefix `0o`) and hexadecimal (prefix `0x`) integer literals (patch 0)
* Structured Bindings (Unpacking Arrays) (Possible future feature: Unpacking of objects and dictionaries) (patch 0)
  eg. `var [x, y] = [1, 2];`
* `"mfextensions"`-entry in `version()`,
  the value is the number of changes to this extension since 11.01.2020,
  the other version information is kept equal to the correspoinding original TScript version

## Portable checking for this extended version
* `version().has("mfextensions")`, it results in `true` in this extended version, `false` otherwise

See the documentation for detailed information about the extensions.

<!--
## Getting Started
TScript comes as a single html file. It does not require installation.
Simply open the file in a modern browser and you are ready to go.
[Click here for a quick test.](https://github.com/TGlas/tscript/distribution/index.html)
For more serious use it is recommended to store the page in your local
file system &mdash; use "save link as" (or similar) from the context
menu.

TScript comes with a complete integrated development environment (IDE).
You can start programming straight away in the source code editor on
the left. Documentation is also built-in - try the Documentation button
on the right of the toolbar.

## Example Programs
In TScript, "hello world" is a one-liner:
```
print("Hello World");
```
For proper example code have a look at the [examples](https://github.com/TGlas/tscript/tree/master/examples)
directory. Demos of the examples:
 - [turtle graphics: snowflake](https://tglas.github.io/tscript/examples/demos/snowflake.html)
 - [canvas graphics: game of life](https://tglas.github.io/tscript/examples/demos/gameoflife.html)
 - [canvas graphics: 3D cube](https://tglas.github.io/tscript/examples/demos/cube3D.html)

## Documentation
The documentation is included in the IDE. It can be accessed with the
button at the top right. It is also available
[here.](https://tglas.github.io/tscript/distribution/index.html?doc)

## Testing
If something does not work as expected then please run the
[unit tests](https://tglas.github.io/tscript/source/unittest.html)
in your browser. If a test should fail then please
[report a bug](https://github.com/TGlas/tscript/issues).
-->

## Author
TScript is developed by Tobias Glasmachers.
The Extensions to TScript are developed by Manuel Fischer.

## License
This project is licensed under the MIT License - see the
[LICENSE](LICENSE) file for details.

## Acknowledgments
The TScript IDE uses [CodeMirror](https://codemirror.net/)
and [interact](https://interactjs.io/).
