import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useThemeMode } from "@/hooks/use-theme-mode";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export default function AuthLayout() {
	const { isReady, isAuthenticated } = useSession();
	const { isDark } = useThemeMode();

	if (!isReady) {
		return (
			<View
				className={cn(
					"flex-1 justify-center items-center",
					isDark ? "bg-zinc-950" : "bg-zinc-50",
				)}
			>
				<ActivityIndicator size={48} />
			</View>
		);
	}

	if (isAuthenticated) {
		return <Redirect href="/(app)" />;
	}

	return (
		<Stack>
			<Stack.Screen name="index" options={{ headerShown: false }} />
			<Stack.Screen name="sign-in" options={{ title: "Sign in" }} />
		</Stack>
	);
}
