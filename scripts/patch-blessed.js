#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to blessed's widget.js file
const widgetPath = path.join(__dirname, "..", "node_modules", "blessed", "lib", "widget.js");
// Path to blessed's tput.js file
const tputPath = path.join(__dirname, "..", "node_modules", "blessed", "lib", "tput.js");

try {
	// Patch widget.js for static bundling
	let widgetContent = fs.readFileSync(widgetPath, "utf8");

	// Check if it's already patched
	if (widgetContent.includes("// Static widget imports for bundling")) {
		console.log("✓ Blessed widget.js already patched for static bundling");
	} else {
		// Find the dynamic require pattern
		const dynamicPattern =
			/widget\.classes\.forEach\(function\(name\)\s*{\s*var\s+file\s*=\s*name\.toLowerCase\(\);\s*widget\[name\]\s*=\s*widget\[file\]\s*=\s*require\('\.\/widgets\/'\s*\+\s*file\);\s*}\);/;

		if (!dynamicPattern.test(widgetContent)) {
			console.error("Warning: Could not find expected pattern in blessed/lib/widget.js");
			console.error("The file may have already been modified or has a different structure.");
		} else {
			// Replace with static requires
			const replacement = `// Static widget imports for bundling
var widgets = {
  node: require('./widgets/node'),
  screen: require('./widgets/screen'),
  element: require('./widgets/element'),
  box: require('./widgets/box'),
  text: require('./widgets/text'),
  line: require('./widgets/line'),
  scrollablebox: require('./widgets/scrollablebox'),
  scrollabletext: require('./widgets/scrollabletext'),
  bigtext: require('./widgets/bigtext'),
  list: require('./widgets/list'),
  form: require('./widgets/form'),
  input: require('./widgets/input'),
  textarea: require('./widgets/textarea'),
  textbox: require('./widgets/textbox'),
  button: require('./widgets/button'),
  progressbar: require('./widgets/progressbar'),
  filemanager: require('./widgets/filemanager'),
  checkbox: require('./widgets/checkbox'),
  radioset: require('./widgets/radioset'),
  radiobutton: require('./widgets/radiobutton'),
  prompt: require('./widgets/prompt'),
  question: require('./widgets/question'),
  message: require('./widgets/message'),
  loading: require('./widgets/loading'),
  listbar: require('./widgets/listbar'),
  log: require('./widgets/log'),
  table: require('./widgets/table'),
  listtable: require('./widgets/listtable'),
  // Exclude widgets with optional dependencies
  // terminal: require('./widgets/terminal'), // requires term.js and pty.js
  // image: require('./widgets/image'), // requires node-png
  // ansiimage: require('./widgets/ansiimage'),
  // overlayimage: require('./widgets/overlayimage'),
  // video: require('./widgets/video'),
  layout: require('./widgets/layout')
};

widget.classes.forEach(function(name) {
  var file = name.toLowerCase();
  widget[name] = widget[file] = widgets[file];
});`;

			// Replace the dynamic loading
			widgetContent = widgetContent.replace(dynamicPattern, replacement);

			// Write the patched file
			fs.writeFileSync(widgetPath, widgetContent);
			console.log("✓ Patched blessed widget.js for static bundling");
		}
	}

	// Patch tput.js to handle missing terminfo files gracefully
	let tputContent = fs.readFileSync(tputPath, "utf8");

	// Check if it's already patched
	if (tputContent.includes("// Patched to handle missing terminfo files")) {
		console.log("✓ Blessed tput.js already patched for terminfo handling");
	} else {
		// Find the readTerminfo function and patch it
		const readTerminfoPattern =
			/Tput\.prototype\.readTerminfo = function\(term\) \{\s*var data\s*,\s*file\s*,\s*info;\s*term = term \|\| this\.terminal;\s*file = path\.normalize\(this\._prefix\(term\)\);\s*data = fs\.readFileSync\(file\);\s*info = this\.parseTerminfo\(data, file\);\s*if \(this\.debug\) \{\s*this\._terminfo = info;\s*\}\s*return info;\s*\};/;

		if (!readTerminfoPattern.test(tputContent)) {
			console.error("Warning: Could not find readTerminfo function in blessed/lib/tput.js");
			console.error("The file may have already been modified or has a different structure.");
		} else {
			// Replace with patched version that handles missing files gracefully
			// This version creates a minimal terminfo object instead of causing recursion
			const replacement = `Tput.prototype.readTerminfo = function(term) {
  var data
    , file
    , info;

  term = term || this.terminal;

  try {
    file = path.normalize(this._prefix(term));
    data = fs.readFileSync(file);
    info = this.parseTerminfo(data, file);

    if (this.debug) {
      this._terminfo = info;
    }

    return info;
  } catch (e) {
    // Patched to handle missing terminfo files
    // Create a minimal terminfo object for basic terminal operations
    if (this.debug) {
      console.warn('Terminfo file not found, using minimal fallback:', e.message);
    }
    
    // Return a minimal terminfo object that won't cause recursion
    return {
      name: term || 'xterm',
      names: [term || 'xterm'],
      desc: 'Minimal fallback terminfo',
      bools: {},
      nums: {},
      numbers: {},
      strs: {},
      strings: {},
      acs: {},
      has: () => false, // function for feature detection
      termcap: {},
      header: {
        dataSize: 0,
        headerSize: 12,
        magicNumber: 0x11A,
        namesSize: 0,
        boolCount: 0,
        numCount: 0,
        strCount: 0,
        strTableSize: 0,
        total: 12
      }
    };
  }
};`;

			// Replace the function
			tputContent = tputContent.replace(readTerminfoPattern, replacement);

			// Write the patched file
			fs.writeFileSync(tputPath, tputContent);
			console.log("✓ Patched blessed tput.js for graceful terminfo handling");
		}
	}

	console.log("✓ Blessed patching completed successfully");
} catch (error) {
	console.error("✗ Failed to patch blessed:", error.message);
	process.exit(1);
}
