import { cva } from "class-variance-authority";
import React from "react";
import { Text, View } from "react-native";

import { useThemeMode } from "@/hooks/use-theme-mode";
import { cn } from "@/lib/utils";

import { EditScreenInfo } from "./EditScreenInfo";

interface ScreenContentProps {
	title: string;
	path: string;
	children?: React.ReactNode;
}

export const ScreenContent: React.FC<ScreenContentProps> = ({
	title,
	path,
	children,
}) => {
	const { isDark } = useThemeMode();

	return (
		<View
			className={cn(
				containerVariants({ theme: isDark ? "dark" : "light" }),
			)}
		>
			<Text
				className={cn(
					titleVariants({ theme: isDark ? "dark" : "light" }),
				)}
			>
				{title}
			</Text>
			<View
				className={cn(
					separatorVariants({ theme: isDark ? "dark" : "light" }),
				)}
			/>
			<EditScreenInfo path={path} />
			{children}
		</View>
	);
};

const containerVariants = cva("flex flex-1 items-center justify-center px-4", {
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

const separatorVariants = cva("my-7 h-px w-[300px]", {
	variants: {
		theme: {
			dark: "bg-zinc-700",
			light: "bg-zinc-300",
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
