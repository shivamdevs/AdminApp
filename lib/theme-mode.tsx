import {
	createContext,
	useMemo,
	useState,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
} from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "system" | "light" | "dark";

export type ThemeModeContextValue = {
	mode: ThemeMode;
	setMode: Dispatch<SetStateAction<ThemeMode>>;
	cycleMode: () => void;
	resolvedMode: "light" | "dark";
	isDark: boolean;
};

export const ThemeModeContext = createContext<ThemeModeContextValue | null>(
	null,
);

type ThemeModeProviderProps = {
	children: ReactNode;
};

export function ThemeModeProvider({ children }: ThemeModeProviderProps) {
	const systemColorScheme = useColorScheme();
	const [mode, setMode] = useState<ThemeMode>("system");

	const resolvedMode =
		mode === "system" ? (systemColorScheme ?? "dark") : mode;
	const isDark = resolvedMode === "dark";

	const cycleMode = () => {
		setMode((currentMode) => {
			if (currentMode === "system") return "light";
			if (currentMode === "light") return "dark";
			return "system";
		});
	};

	const value = useMemo(
		() => ({ mode, setMode, cycleMode, resolvedMode, isDark }),
		[mode, resolvedMode, isDark],
	);

	return (
		<ThemeModeContext.Provider value={value}>
			{children}
		</ThemeModeContext.Provider>
	);
}
