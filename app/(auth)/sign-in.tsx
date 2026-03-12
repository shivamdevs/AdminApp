import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { Button } from "@/components/Button";
import { useThemeMode } from "@/hooks/use-theme-mode";
import { envFlags } from "@/lib/env";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export default function SignInScreen() {
	const { isDark } = useThemeMode();
	const { errorMessage, isLoading, signIn, signInWithOAuth } = useSession();
	const [identity, setIdentity] = useState("");
	const [password, setPassword] = useState("");

	const handleSignIn = async () => {
		await signIn(identity, password);
		setPassword("");
	};

	return (
		<View
			className={cn(
				"flex-1 p-6",
				isDark ? "bg-zinc-950" : "bg-zinc-50",
			)}
		>
			<Text
				className={cn(
					"text-2xl font-bold",
					isDark ? "text-zinc-50" : "text-zinc-900",
				)}
			>
				Sign in
			</Text>

			<TextInput
				value={identity}
				onChangeText={setIdentity}
				autoCapitalize="none"
				keyboardType="email-address"
				placeholder="Email or username"
				placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
				className={cn(
					"mt-6 rounded-xl border px-4 py-3",
					isDark
						? "border-zinc-700 bg-zinc-950 text-zinc-100"
						: "border-zinc-200 bg-zinc-100 text-zinc-900",
				)}
			/>

			<TextInput
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				placeholder="Password"
				placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
				className={cn(
					"mt-3 rounded-xl border px-4 py-3",
					isDark
						? "border-zinc-700 bg-zinc-950 text-zinc-100"
						: "border-zinc-200 bg-zinc-100 text-zinc-900",
				)}
			/>

			{errorMessage
				? (
					<Text className="mt-3 text-sm text-rose-500">
						{errorMessage}
					</Text>
				)
				: null}

			<Button
				title={isLoading ? "Signing in..." : "Sign in"}
				onPress={handleSignIn}
				disabled={isLoading || !identity || !password ||
					!envFlags.hasPocketBaseUrl}
				className="mt-5"
			/>

			<Button
				title={isLoading ? "Please wait..." : "Continue with Google"}
				onPress={() => void signInWithOAuth("google")}
				disabled={isLoading || !envFlags.hasPocketBaseUrl}
				className="mt-3"
			/>

			<Button
				title={isLoading ? "Please wait..." : "Continue with GitHub"}
				onPress={() => void signInWithOAuth("github")}
				disabled={isLoading || !envFlags.hasPocketBaseUrl}
				className="mt-3"
			/>
		</View>
	);
}
