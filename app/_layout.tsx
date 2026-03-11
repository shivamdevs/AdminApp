import { Colors } from "@/constants/theme";
import { useThemeMode } from "@/hooks/use-theme-mode";
import { installConsoleInterceptor } from "@/lib/logger";
import { SessionProvider } from "@/lib/session";
import { ThemeModeProvider } from "@/lib/theme-mode";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import "react-native-reanimated";
import "./global.css";

export default function Layout() {
	useEffect(() => {
		installConsoleInterceptor();
	}, []);

	return (
		<ThemeModeProvider>
			<SessionProvider>
				<LayoutContent />
			</SessionProvider>
		</ThemeModeProvider>
	);
}

function LayoutContent() {
	const { isDark, resolvedMode } = useThemeMode();
	const palette = Colors[resolvedMode];

	const navigationTheme = useMemo(() => {
		const baseTheme = isDark ? DarkTheme : DefaultTheme;

		return {
			...baseTheme,
			colors: {
				...baseTheme.colors,
				primary: palette.tint,
				background: palette.background,
				card: palette.background,
				text: palette.text,
				border: palette.icon,
				notification: palette.tint,
			},
		};
	}, [isDark, palette]);

	return (
		<ThemeProvider value={navigationTheme}>
			<View
				className={isDark ? "flex-1 bg-zinc-950" : "flex-1 bg-zinc-50"}
			>
				<StatusBar style={isDark ? "light" : "dark"} />
				<Slot />
			</View>
		</ThemeProvider>
	);
}
