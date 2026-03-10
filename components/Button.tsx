import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import {
	Text,
	TouchableOpacity,
	TouchableOpacityProps,
	View,
} from "react-native";

import { useThemeMode } from "@/hooks/use-theme-mode";
import { cn } from "@/lib/utils";

interface ButtonProps extends TouchableOpacityProps {
	title: string;
}

export const Button = forwardRef<View, ButtonProps>(
	({ title, ...touchableProps }, ref) => {
		const { isDark } = useThemeMode();

		return (
			<TouchableOpacity
				ref={ref}
				{...touchableProps}
				className={cn(
					buttonVariants({ theme: isDark ? "dark" : "light" }),
					touchableProps.className,
				)}
			>
				<Text
					className={cn(
						buttonTextVariants({
							theme: isDark ? "dark" : "light",
						}),
					)}
				>
					{title}
				</Text>
			</TouchableOpacity>
		);
	},
);

Button.displayName = "Button";

const buttonVariants = cva("w-full items-center rounded-[28px] p-4 shadow-md", {
	variants: {
		theme: {
			dark: "bg-emerald-600",
			light: "bg-emerald-700",
		},
	},
	defaultVariants: {
		theme: "dark",
	},
});

const buttonTextVariants = cva("text-center text-lg font-semibold", {
	variants: {
		theme: {
			dark: "text-white",
			light: "text-white",
		},
	},
	defaultVariants: {
		theme: "dark",
	},
});
