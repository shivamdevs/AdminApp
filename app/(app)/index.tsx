import { cva } from "class-variance-authority";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { useThemeMode } from "@/hooks/use-theme-mode";
import { pb, type UserDeviceRecord } from "@/lib/pocketbase";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

const containerVariants = cva("flex flex-1 p-safe", {
	variants: {
		theme: {
			dark: "bg-zinc-950",
			light: "bg-zinc-50",
		},
	},
});

const cardVariants = cva("mb-4 rounded-2xl p-4", {
	variants: {
		theme: {
			dark: "bg-zinc-900",
			light: "bg-white",
		},
	},
});

const titleVariants = cva("text-2xl font-bold", {
	variants: {
		theme: {
			dark: "text-zinc-100",
			light: "text-zinc-900",
		},
	},
});

const subTitleVariants = cva("mt-1 text-sm", {
	variants: {
		theme: {
			dark: "text-zinc-400",
			light: "text-zinc-600",
		},
	},
});

export default function Home() {
	const { isDark } = useThemeMode();
	const { isAllowed, refreshAuth, signOut, user } = useSession();
	const [dashboardError, setDashboardError] = useState<string | null>(null);
	const [isFetchingDashboard, setIsFetchingDashboard] = useState(false);
	const [userDeviceRows, setUserDeviceRows] = useState<UserDeviceRecord[]>(
		[],
	);

	const loadDashboard = useCallback(async () => {
		if (!isAllowed) return;

		setIsFetchingDashboard(true);
		setDashboardError(null);

		try {
			const result = await pb
				.collection<UserDeviceRecord>("user_devices")
				.getList(1, 20, {
					sort: "-updated",
					expand: "user,device,device.info,device.appVersion",
				});

			setUserDeviceRows(result.items);
		} catch {
			setDashboardError("Failed to load dashboard data from PocketBase.");
		}

		setIsFetchingDashboard(false);
	}, [isAllowed]);

	useEffect(() => {
		if (isAllowed) {
			void loadDashboard();
		}
	}, [isAllowed, loadDashboard]);

	const summary = useMemo(() => {
		const activeLinks = userDeviceRows.filter(
			(item) => item.isActive,
		).length;
		const uniqueUsers = new Set(userDeviceRows.map((item) => item.user))
			.size;

		return {
			totalLinks: userDeviceRows.length,
			activeLinks,
			uniqueUsers,
		};
	}, [userDeviceRows]);

	return (
		<ScrollView
			contentContainerClassName={cn(
				"flex-grow p-5 pb-safe",
				containerVariants({ theme: isDark ? "dark" : "light" }),
			)}
		>
			{!isAllowed
				? (
					<View
						className={cn(
							cardVariants({ theme: isDark ? "dark" : "light" }),
						)}
					>
						<Text
							className={cn(
								titleVariants({
									theme: isDark ? "dark" : "light",
								}),
								"text-xl",
							)}
						>
							Access blocked
						</Text>
						<Text
							className={cn(
								subTitleVariants({
									theme: isDark ? "dark" : "light",
								}),
							)}
						>
							Only owner/admin users can access this app. Current
							role: {user?.role ?? "unknown"}
						</Text>
						<Button
							title="Sign out"
							onPress={() => void signOut()}
							className="mt-4"
						/>
					</View>
				)
				: null}

			{isAllowed
				? (
					<>
						<View
							className={cn(
								cardVariants({
									theme: isDark ? "dark" : "light",
								}),
							)}
						>
							<Text
								className={cn(
									titleVariants({
										theme: isDark ? "dark" : "light",
									}),
									"text-xl",
								)}
							>
								Welcome, {user?.name || user?.username}
							</Text>
							<Text
								className={cn(
									subTitleVariants({
										theme: isDark ? "dark" : "light",
									}),
								)}
							>
								Role: {user?.role}
							</Text>
						</View>

						<View
							className={cn(
								cardVariants({
									theme: isDark ? "dark" : "light",
								}),
							)}
						>
							<Text
								className={cn(
									subTitleVariants({
										theme: isDark ? "dark" : "light",
									}),
								)}
							>
								User-device links
							</Text>
							<Text
								className={cn(
									titleVariants({
										theme: isDark ? "dark" : "light",
									}),
									"text-3xl",
								)}
							>
								{summary.totalLinks}
							</Text>
							<Text
								className={cn(
									subTitleVariants({
										theme: isDark ? "dark" : "light",
									}),
									"mt-3",
								)}
							>
								Active: {summary.activeLinks} | Users:{" "}
								{summary.uniqueUsers}
							</Text>
						</View>

						<View
							className={cn(
								cardVariants({
									theme: isDark ? "dark" : "light",
								}),
							)}
						>
							<Text
								className={cn(
									titleVariants({
										theme: isDark ? "dark" : "light",
									}),
									"text-xl",
								)}
							>
								Recent linked devices
							</Text>

							{isFetchingDashboard
								? (
									<Text
										className={cn(
											subTitleVariants({
												theme: isDark
													? "dark"
													: "light",
											}),
											"mt-3",
										)}
									>
										Loading dashboard...
									</Text>
								)
								: null}

							{dashboardError
								? (
									<Text className="mt-3 text-sm text-rose-500">
										{dashboardError}
									</Text>
								)
								: null}

							{!isFetchingDashboard &&
									!dashboardError &&
									userDeviceRows.length === 0
								? (
									<Text
										className={cn(
											subTitleVariants({
												theme: isDark
													? "dark"
													: "light",
											}),
											"mt-3",
										)}
									>
										No records found.
									</Text>
								)
								: null}

							{userDeviceRows.slice(0, 8).map((row) => (
								<View
									key={row.id}
									className={cn(
										"mt-3 rounded-xl border p-3",
										isDark
											? "border-zinc-700"
											: "border-zinc-200",
									)}
								>
									<Text
										className={cn(
											isDark
												? "text-zinc-100"
												: "text-zinc-900",
										)}
									>
										{row.expand?.user?.email ?? row.user}
									</Text>
									<Text
										className={cn(
											subTitleVariants({
												theme: isDark
													? "dark"
													: "light",
											}),
											"mt-1",
										)}
									>
										{row.expand?.device?.expand?.info
											?.model ??
											"Unknown model"} | App{" "}
										{row.expand?.device?.expand?.appVersion
											?.version ??
											"-"} | Active:{" "}
										{row.isActive ? "yes" : "no"}
									</Text>
								</View>
							))}
						</View>

						<Button
							title="Refresh"
							onPress={() => void loadDashboard()}
							className="mb-3"
						/>
						<Button
							title="Refresh Auth"
							onPress={() => void refreshAuth()}
							className="mb-3"
						/>
						<Button
							title="Sign out"
							onPress={() => void signOut()}
						/>
					</>
				)
				: null}
		</ScrollView>
	);
}
