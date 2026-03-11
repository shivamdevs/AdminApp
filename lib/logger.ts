export type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

type LogInput = {
	screen: string;
	message: string;
	context?: LogContext;
	error?: unknown;
};

type LogEntry = {
	timestamp: string;
	level: LogLevel;
	screen: string;
	message: string;
	context?: LogContext;
};

const levelPriority: Record<LogLevel, number> = {
	debug: 10,
	info: 20,
	warn: 30,
	error: 40,
};

type OriginalConsole = {
	log: (...args: unknown[]) => void;
	debug: (...args: unknown[]) => void;
	info: (...args: unknown[]) => void;
	warn: (...args: unknown[]) => void;
	error: (...args: unknown[]) => void;
};

type LoggerGlobalState = {
	installed: boolean;
	originalConsole: OriginalConsole;
};

const LOGGER_GLOBAL_STATE_KEY = "__ADMIN_APP_LOGGER_STATE__";

function getLoggerState(): LoggerGlobalState {
	const globalScope = globalThis as typeof globalThis & {
		[LOGGER_GLOBAL_STATE_KEY]?: LoggerGlobalState;
	};

	if (!globalScope[LOGGER_GLOBAL_STATE_KEY]) {
		globalScope[LOGGER_GLOBAL_STATE_KEY] = {
			installed: false,
			originalConsole: {
				log: console.log.bind(console),
				debug: console.debug.bind(console),
				info: console.info.bind(console),
				warn: console.warn.bind(console),
				error: console.error.bind(console),
			},
		};
	}

	return globalScope[LOGGER_GLOBAL_STATE_KEY] as LoggerGlobalState;
}

const loggerState = getLoggerState();
const { originalConsole } = loggerState;
let isEmitting = false;

const ansi = {
	reset: "\x1b[0m",
	gray: "\x1b[90m",
	cyan: "\x1b[36m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	red: "\x1b[31m",
};

const structuredLogRegex =
	/^\d{4}-\d{2}-\d{2}T[^|]+\|\s(?:DEBUG|INFO|WARN|ERROR)\s\|/;

function shouldEmit(level: LogLevel) {
	if (__DEV__) return true;
	return levelPriority[level] >= levelPriority.warn;
}

function normalizeError(error: unknown) {
	if (!error) return undefined;

	if (error instanceof Error) {
		return {
			name: error.name,
			message: error.message,
			stack: error.stack,
		};
	}

	return { raw: error };
}

function formatLine(entry: LogEntry) {
	const useColor = __DEV__;
	const levelLabel = entry.level.toUpperCase();

	if (!useColor) {
		return `${entry.timestamp} | ${levelLabel} | ${entry.screen} | ${entry.message}`;
	}

	const levelColor = entry.level === "error"
		? ansi.red
		: entry.level === "warn"
		? ansi.yellow
		: entry.level === "debug"
		? ansi.cyan
		: ansi.green;

	return `${ansi.gray}${entry.timestamp}${ansi.reset} | ${levelColor}${levelLabel}${ansi.reset} | ${ansi.cyan}${entry.screen}${ansi.reset} | ${entry.message}`;
}

function emit(level: LogLevel, input: LogInput) {
	if (!shouldEmit(level)) return;
	if (isEmitting) {
		callOriginalConsole(level, [input.message, input.context]);
		return;
	}

	isEmitting = true;
	try {
		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level,
			screen: input.screen,
			message: input.message,
			context: {
				...(input.context ?? {}),
				...(input.error ? { error: normalizeError(input.error) } : {}),
			},
		};

		const line = formatLine(entry);
		const hasContext = entry.context &&
			Object.keys(entry.context).length > 0;

		if (level === "error") {
			if (hasContext) {
				originalConsole.error(line, entry.context);
				return;
			}
			originalConsole.error(line);
			return;
		}

		if (level === "warn") {
			if (hasContext) {
				originalConsole.warn(line, entry.context);
				return;
			}
			originalConsole.warn(line);
			return;
		}

		if (hasContext) {
			originalConsole.log(line, entry.context);
			return;
		}

		originalConsole.log(line);
	} finally {
		isEmitting = false;
	}
}

function stringifyUnknown(value: unknown) {
	if (typeof value === "string") return value;

	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
}

function callOriginalConsole(level: LogLevel, args: unknown[]) {
	if (level === "error") {
		originalConsole.error(...args);
		return;
	}

	if (level === "warn") {
		originalConsole.warn(...args);
		return;
	}

	if (level === "debug") {
		originalConsole.debug(...args);
		return;
	}

	originalConsole.log(...args);
}

function forwardConsoleCall(level: LogLevel, args: unknown[]) {
	if (args.length === 0) {
		emit(level, { screen: "console", message: "(empty log)" });
		return;
	}

	const firstArg = args[0];
	if (typeof firstArg === "string" && structuredLogRegex.test(firstArg)) {
		callOriginalConsole(level, args);
		return;
	}

	const [first, ...rest] = args;
	const message = stringifyUnknown(first);
	const context = rest.length > 0
		? {
			args: rest,
		}
		: undefined;

	emit(level, {
		screen: "console",
		message,
		context,
	});
}

export const logger = {
	debug: (input: LogInput) => emit("debug", input),
	info: (input: LogInput) => emit("info", input),
	warn: (input: LogInput) => emit("warn", input),
	error: (input: LogInput) => emit("error", input),
};

export function installConsoleInterceptor() {
	if (loggerState.installed) return;
	loggerState.installed = true;

	console.log = (...args: unknown[]) => forwardConsoleCall("info", args);
	console.debug = (...args: unknown[]) => forwardConsoleCall("debug", args);
	console.info = (...args: unknown[]) => forwardConsoleCall("info", args);
	console.warn = (...args: unknown[]) => forwardConsoleCall("warn", args);
	console.error = (...args: unknown[]) => forwardConsoleCall("error", args);

	logger.info({
		screen: "logger",
		message: "Console interceptor installed",
	});
}
