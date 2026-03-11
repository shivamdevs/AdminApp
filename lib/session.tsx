import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";

import { logger } from "@/lib/logger";
import {
	hasAdminAccess,
	hydratePocketBaseAuthStore,
	pb,
	persistPocketBaseAuthState,
	type AuthUserRecord,
} from "@/lib/pocketbase";

type SessionContextValue = {
	isReady: boolean;
	isAuthenticated: boolean;
	isAllowed: boolean;
	isLoading: boolean;
	errorMessage: string | null;
	user: AuthUserRecord | null;
	signIn: (identity: string, password: string) => Promise<void>;
	signInWithOAuth: (provider: "google" | "github") => Promise<void>;
	signOut: () => Promise<void>;
	refreshAuth: () => Promise<void>;
};

type OAuthMethod = {
	name: string;
	authURL: string;
	codeVerifier: string;
};

const SessionContext = createContext<SessionContextValue | null>(null);

type SessionProviderProps = {
	children: ReactNode;
};

export function SessionProvider({ children }: SessionProviderProps) {
	const [isReady, setIsReady] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [user, setUser] = useState<AuthUserRecord | null>(null);

	const isAllowed = hasAdminAccess(user?.role);
	const isAuthenticated = Boolean(user);

	const syncCurrentRecord = useCallback(() => {
		setUser((pb.authStore.record as AuthUserRecord | null) ?? null);
	}, []);

	const refreshAuth = useCallback(async () => {
		if (!pb.authStore.token) {
			logger.debug({
				screen: "auth/session",
				message: "refresh skipped: no token in authStore",
			});
			setUser(null);
			return;
		}

		try {
			logger.info({
				screen: "auth/session",
				message: "refreshing auth token",
			});
			await pb.collection("users").authRefresh();
			syncCurrentRecord();
			logger.info({
				screen: "auth/session",
				message: "auth refresh success",
			});
		} catch (error) {
			logger.warn({
				screen: "auth/session",
				message: "auth refresh failed; clearing authStore",
				error,
			});
			pb.authStore.clear();
			setUser(null);
		}
	}, [syncCurrentRecord]);

	const signIn = useCallback(
		async (identity: string, password: string) => {
			logger.info({
				screen: "auth/session",
				message: "password sign-in requested",
				context: {
					identity: identity.trim(),
				},
			});
			setIsLoading(true);
			setErrorMessage(null);

			try {
				const authResponse = await pb
					.collection<AuthUserRecord>("users")
					.authWithPassword(identity.trim(), password);

				if (!hasAdminAccess(authResponse.record.role)) {
					logger.warn({
						screen: "auth/session",
						message: "password sign-in blocked by role",
						context: {
							role: authResponse.record.role,
						},
					});
					pb.authStore.clear();
					setUser(null);
					setErrorMessage(
						"Only owner/admin users can access this app.",
					);
					await persistPocketBaseAuthState();
					return;
				}

				syncCurrentRecord();
				await persistPocketBaseAuthState();
				logger.info({
					screen: "auth/session",
					message: "password sign-in success",
					context: {
						role: authResponse.record.role,
					},
				});
			} catch (error) {
				logger.warn({
					screen: "auth/session",
					message: "password sign-in failed",
					error,
				});
				setErrorMessage(
					"Login failed. Please verify your credentials.",
				);
			} finally {
				setIsLoading(false);
			}
		},
		[syncCurrentRecord],
	);

	const signInWithOAuth = useCallback(
		async (provider: "google" | "github") => {
			logger.info({
				screen: "auth/session",
				message: "oauth sign-in requested",
				context: { provider },
			});
			setIsLoading(true);
			setErrorMessage(null);

			try {
				const methods = await pb.collection("users").listAuthMethods();
				const oauthMethod = methods.oauth2.providers.find(
					(item) => item.name === provider,
				) as OAuthMethod | undefined;

				if (!oauthMethod) {
					logger.warn({
						screen: "auth/session",
						message: "oauth provider unavailable",
						context: { provider },
					});
					setErrorMessage(
						`${provider} login is not enabled in PocketBase.`,
					);
					return;
				}

				const redirectUrl = Linking.createURL("/oauth-callback");
				const authUrl = `${oauthMethod.authURL}${encodeURIComponent(redirectUrl)}`;

				const result = await WebBrowser.openAuthSessionAsync(
					authUrl,
					redirectUrl,
				);

				if (result.type !== "success" || !result.url) {
					logger.warn({
						screen: "auth/session",
						message: "oauth cancelled or failed before redirect",
						context: {
							provider,
							resultType: result.type,
						},
					});
					setErrorMessage("OAuth sign-in was cancelled.");
					return;
				}

				const { queryParams } = Linking.parse(result.url);
				const code =
					typeof queryParams?.code === "string"
						? queryParams.code
						: undefined;

				if (!code) {
					logger.warn({
						screen: "auth/session",
						message: "oauth callback missing code",
						context: {
							provider,
						},
					});
					setErrorMessage(
						"OAuth sign-in failed to return an auth code.",
					);
					return;
				}

				const authResponse = await pb
					.collection<AuthUserRecord>("users")
					.authWithOAuth2Code(
						provider,
						code,
						oauthMethod.codeVerifier,
						redirectUrl,
					);

				if (!hasAdminAccess(authResponse.record.role)) {
					logger.warn({
						screen: "auth/session",
						message: "oauth sign-in blocked by role",
						context: {
							provider,
							role: authResponse.record.role,
						},
					});
					pb.authStore.clear();
					setUser(null);
					setErrorMessage(
						"Only owner/admin users can access this app.",
					);
					await persistPocketBaseAuthState();
					return;
				}

				syncCurrentRecord();
				await persistPocketBaseAuthState();
				logger.info({
					screen: "auth/session",
					message: "oauth sign-in success",
					context: {
						provider,
						role: authResponse.record.role,
					},
				});
			} catch (error) {
				logger.warn({
					screen: "auth/session",
					message: "oauth sign-in failed",
					error,
				});
				setErrorMessage("OAuth sign-in failed. Please try again.");
			} finally {
				setIsLoading(false);
			}
		},
		[syncCurrentRecord],
	);

	const signOut = useCallback(async () => {
		logger.info({
			screen: "auth/session",
			message: "sign-out requested",
		});
		pb.authStore.clear();
		setUser(null);
		setErrorMessage(null);
		await persistPocketBaseAuthState();
		logger.info({
			screen: "auth/session",
			message: "sign-out complete",
		});
	}, []);

	useEffect(() => {
		const unbind = pb.authStore.onChange(() => {
			logger.info({
				screen: "auth/session",
				message: "authStore changed",
				context: {
					hasToken: Boolean(pb.authStore.token),
					recordId: (pb.authStore.record as { id?: string } | null)
						?.id,
				},
			});
			syncCurrentRecord();
			void persistPocketBaseAuthState();
		});

		const bootstrap = async () => {
			logger.info({
				screen: "auth/session",
				message: "bootstrap start",
			});
			await hydratePocketBaseAuthStore();
			syncCurrentRecord();
			await refreshAuth();
			setIsReady(true);
			logger.info({
				screen: "auth/session",
				message: "bootstrap complete",
				context: {
					hasToken: Boolean(pb.authStore.token),
					recordId: (pb.authStore.record as { id?: string } | null)
						?.id,
				},
			});
		};

		void bootstrap();

		return () => {
			unbind();
		};
	}, [refreshAuth, syncCurrentRecord]);

	const value = useMemo(
		() => ({
			isReady,
			isAuthenticated,
			isAllowed,
			isLoading,
			errorMessage,
			user,
			signIn,
			signInWithOAuth,
			signOut,
			refreshAuth,
		}),
		[
			errorMessage,
			isAllowed,
			isAuthenticated,
			isLoading,
			isReady,
			refreshAuth,
			signIn,
			signInWithOAuth,
			signOut,
			user,
		],
	);

	return (
		<SessionContext.Provider value={value}>
			{children}
		</SessionContext.Provider>
	);
}

export function useSession() {
	const context = useContext(SessionContext);
	if (!context) {
		throw new Error("useSession must be used within SessionProvider");
	}

	return context;
}
