import { Colors } from "@/constants/theme";
import { useThemeMode } from "@/hooks/use-theme-mode";
import { ThemeModeProvider } from "@/lib/theme-mode";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { View } from "react-native";
import "react-native-reanimated";
import "./global.css";

export const unstable_settings = {
	// anchor: "(tabs)",
};

export default function Layout() {
	return (
		<ThemeModeProvider>
			<LayoutContent />
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
				<Stack
					screenOptions={{
						headerStyle: {
							backgroundColor: navigationTheme.colors.card,
						},
						headerTintColor: navigationTheme.colors.text,
						headerTitleStyle: {
							color: navigationTheme.colors.text,
						},
						contentStyle: {
							backgroundColor: navigationTheme.colors.background,
						},
					}}
				>
					<Stack.Screen name="index" options={{ title: "Home" }} />
					<Stack.Screen
						name="details"
						options={{ title: "Details" }}
					/>
				</Stack>
			</View>
		</ThemeProvider>
	);
}
