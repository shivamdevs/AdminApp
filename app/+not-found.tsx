import { cva } from "class-variance-authority";
import { Link, Stack } from "expo-router";

import { Text, View } from "react-native";

import { useThemeMode } from "@/hooks/use-theme-mode";
import { cn } from "@/lib/utils";

export default function NotFoundScreen() {
	const { isDark } = useThemeMode();

	return (
		<View
			className={cn(
				containerVariants({ theme: isDark ? "dark" : "light" }),
			)}
		>
			<Stack.Screen options={{ title: "Oops!" }} />
			<View className={styles.contentContainer}>
				<Text
					className={cn(
						titleVariants({ theme: isDark ? "dark" : "light" }),
					)}
				>
					{"This screen doesn't exist."}
				</Text>
				<Link href="/" className={styles.link}>
					<Text
						className={cn(
							linkTextVariants({
								theme: isDark ? "dark" : "light",
							}),
						)}
					>
						Go to home screen!
					</Text>
				</Link>
			</View>
		</View>
	);
}

const styles = {
	contentContainer: `flex flex-1 m-6`,
	link: `mt-4 pt-4`,
};

const containerVariants = cva("flex flex-1", {
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

const titleVariants = cva("text-xl font-bold", {
	variants: {
		theme: {
			dark: "text-zinc-50",
			light: "text-zinc-900",
		},
	},
	defaultVariants: {
		theme: "dark",
	},
});

const linkTextVariants = cva("text-base", {
	variants: {
		theme: {
			dark: "text-emerald-400",
			light: "text-emerald-700",
		},
	},
	defaultVariants: {
		theme: "dark",
	},
});
