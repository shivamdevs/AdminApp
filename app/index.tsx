import { cva } from "class-variance-authority";
import { router } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { useThemeMode } from "@/hooks/use-theme-mode";
import { cn } from "@/lib/utils";

import { ScreenContent } from "@/components/ScreenContent";

const containerVariants = cva("flex flex-1 p-safe", {
	variants: {
		theme: {
			dark: "bg-zinc-950",
			light: "bg-zinc-50",
		},
	},
	defaultVariants: {
		theme: "dark",
	},
});

export default function Home() {
	const { mode, cycleMode, isDark } = useThemeMode();
	const modeLabel = mode.charAt(0).toUpperCase() + mode.slice(1);

	return (
		<View
			className={cn(
				containerVariants({ theme: isDark ? "dark" : "light" }),
			)}
		>
			<ScreenContent path="app/index.tsx" title="Home" />

			<View className={styles.buttonWrapper}>
				<Button
					title={`Theme: ${modeLabel} (Tap to switch)`}
					onPress={cycleMode}
					className="mb-3"
				/>

				<Button
					title="Show Details"
					onPress={() =>
						router.push({
							pathname: "/details",
							params: { name: "Dan" },
						})
					}
				/>
			</View>
		</View>
	);
}

const styles = {
	buttonWrapper: "w-full pb-safe",
};
