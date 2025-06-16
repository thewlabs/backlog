/*
 * Lightweight wrapper around the `blessed` terminal UI library.
 *
 * With Bun's `--compile` the dependency is bundled, so we import it
 * directly and only fall back to plain text when not running in a TTY.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { stdin as input, stdout as output } from "node:process";
import blessed from "bbblessed";

// Helper to create a blessed screen with Tput disabled.
// This avoids looking up terminfo files which are not
// bundled with the compiled Windows binary.
// biome-ignore lint/suspicious/noExplicitAny: blessed types are loosely defined
export function createScreen(options: any = {}): any {
	// Only disable tput on Windows to prevent terminfo file loading errors
	// On other platforms, let blessed use its normal tput system
	const isWindows = process.platform === "win32";

	// biome-ignore lint/suspicious/noExplicitAny: blessed types are loosely defined
	const programOptions: any = isWindows
		? {
				tput: false,
				termcap: false,
				extended: false,
				terminal: "dumb",
			}
		: {};

	const program = blessed.program(programOptions);

	// On Windows only, provide minimal stubs to prevent errors
	if (isWindows) {
		// biome-ignore lint/suspicious/noExplicitAny: needed for Windows tput workaround
		(program as any)._tputSetup = true;

		// Provide a no-op csr method that bbblessed expects
		// biome-ignore lint/suspicious/noExplicitAny: needed for Windows tput workaround
		(program as any).csr = () => "";

		// Create a minimal tput object with required properties
		// biome-ignore lint/suspicious/noExplicitAny: needed for Windows tput workaround
		const minimalTput: any = {
			// Basic properties that screen expects
			unicode: false,
			numbers: { U8: 0 },
			features: { unicode: false },
			// Common terminal capabilities as raw escape codes
			strings: {
				cup: "\x1b[%i%d;%dH", // cursor position
				clear: "\x1b[H\x1b[2J", // clear screen
				ed: "\x1b[J", // clear to end of display
				el: "\x1b[K", // clear to end of line
				smcup: "\x1b[?1049h", // save screen
				rmcup: "\x1b[?1049l", // restore screen
				civis: "\x1b[?25l", // hide cursor
				cnorm: "\x1b[?25h", // show cursor
				ena_acs: "", // enable alternate character set (not needed on Windows)
			} as Record<string, string>,
		};

		// Set tput
		// biome-ignore lint/suspicious/noExplicitAny: needed for Windows tput workaround
		(program as any).tput = minimalTput;

		// Provide enacs method that screen expects
		minimalTput.enacs = () => "";

		// bbblessed has a bug where it uses this.put instead of this.tput.strings
		// We need to provide methods that return the escape sequences
		// biome-ignore lint/suspicious/noExplicitAny: needed for Windows tput workaround
		(program as any).put = {
			smcup: () => minimalTput.strings.smcup,
			rmcup: () => minimalTput.strings.rmcup,
			keypad_xmit: () => "\x1b[?1h\x1b=", // application keypad mode
			keypad_local: () => "\x1b[?1l\x1b>", // normal keypad mode
			// Provide all methods as no-ops by default
			...Object.fromEntries(Object.keys(minimalTput.strings).map((key) => [key, () => minimalTput.strings[key]])),
		};
	}

	return blessed.screen({
		smartCSR: true,
		program,
		tput: !isWindows, // Use tput on non-Windows platforms
		...options,
	});
}

// Ask the user for a single line of input.  Falls back to readline.
export async function promptText(message: string, defaultValue = ""): Promise<string> {
	// Always use readline for simple text input to avoid blessed rendering quirks
	const { createInterface } = await import("node:readline/promises");
	const rl = createInterface({ input, output });
	const answer = (await rl.question(`${message} `)).trim();
	rl.close();
	return answer || defaultValue;
}

// Display long content in a scrollable viewer.
export async function scrollableViewer(content: string): Promise<void> {
	if (output.isTTY === false) {
		console.log(content);
		return;
	}

	return new Promise<void>((resolve) => {
		const screen = createScreen({
			style: { fg: "white", bg: "black" },
		});

		const box = blessed.box({
			parent: screen,
			content,
			scrollable: true,
			alwaysScroll: true,
			keys: true,
			vi: true,
			mouse: true,
			width: "100%",
			height: "100%",
			padding: { left: 1, right: 1 },
			wrap: true,
		});

		screen.key(["escape", "q", "C-c"], () => {
			screen.destroy();
			resolve();
		});

		box.focus();
		screen.render();
	});
}
