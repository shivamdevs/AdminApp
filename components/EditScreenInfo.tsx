import { cva } from "class-variance-authority";
import React from "react";
import { Text, View } from "react-native";

import { useThemeMode } from "@/hooks/use-theme-mode";
import { cn } from "@/lib/utils";

interface EditScreenInfoProps {
	path: string;
}

export const EditScreenInfo: React.FC<EditScreenInfoProps> = ({ path }) => {
	const { isDark } = useThemeMode();
	const title = "Open up the code for this screen:";
	const description =
		"Change any of the text, save the file, and your app will automatically update.";

	return (
		<View>
			<View className="items-center mx-12">
				<Text
					className={cn(
						textVariants({ theme: isDark ? "dark" : "light" }),
					)}
				>
					{title}
				</Text>
				<View
					className={cn(
						codeContainerVariants({
							theme: isDark ? "dark" : "light",
						}),
						"my-2",
					)}
				>
					<Text
						className={cn(
							codeTextVariants({
								theme: isDark ? "dark" : "light",
							}),
						)}
					>
						{path}
					</Text>
				</View>
				<Text
					className={cn(
						textVariants({ theme: isDark ? "dark" : "light" }),
					)}
				>
					{description}
				</Text>
			</View>
		</View>
	);
};

const textVariants = cva("text-center text-lg leading-6", {
	variants: {
		theme: {
			dark: "text-zinc-300",
			light: "text-zinc-700",
		},
	},
	defaultVariants: {
		theme: "dark",
	},
});

const codeContainerVariants = cva("rounded-md border px-2 py-1", {
	variants: {
		theme: {
			dark: "border-zinc-700 bg-zinc-900",
			light: "border-zinc-300 bg-zinc-100",
		},
	},
	defaultVariants: {
		theme: "dark",
	},
});

const codeTextVariants = cva("", {
	variants: {
		theme: {
			dark: "text-zinc-100",
			light: "text-zinc-900",
		},
	},
	defaultVariants: {
		theme: "dark",
	},
});
