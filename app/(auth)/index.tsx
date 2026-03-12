import { router } from "expo-router";
import { Text, View } from "react-native";

import { Button } from "@/components/Button";
import { useThemeMode } from "@/hooks/use-theme-mode";
import { cn } from "@/lib/utils";

export default function AuthWelcome() {
	const { isDark } = useThemeMode();

	return (
		<View
			className={cn(
				"flex-1 justify-center p-6",
				isDark ? "bg-zinc-950" : "bg-zinc-50",
			)}
		>
			<Text
				className={cn(
					"text-3xl font-bold",
					isDark ? "text-zinc-50" : "text-zinc-900",
				)}
			>
				Welcome
			</Text>
			<Text
				className={cn(
					"mt-3 text-base",
					isDark ? "text-zinc-400" : "text-zinc-600",
				)}
			>
				This is the admin app onboarding screen. Replace this copy with
				your product messaging later.
			</Text>

			<Button
				title="Continue to Sign in"
				onPress={() => router.push("/(auth)/sign-in")}
				className="mt-8"
			/>
		</View>
	);
}
