import AsyncStorage from "@react-native-async-storage/async-storage";
import PocketBase, { BaseAuthStore } from "pocketbase";

import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export type UserRole = "owner" | "admin" | "manager" | "user";

export type AuthUserRecord = {
	id: string;
	email: string;
	name?: string;
	username: string;
	role: UserRole;
	avatarUrl?: string;
};

export type UserDeviceRecord = {
	id: string;
	user: string;
	device: string;
	isActive?: boolean;
	updated: string;
	expand?: {
		user?: Pick<
			AuthUserRecord,
			"id" | "email" | "name" | "username" | "role"
		>;
		device?: {
			id: string;
			deviceId?: string;
			lastSeen?: string;
			pushProvider?: "fcm" | "apns" | "webpush";
			expand?: {
				appVersion?: {
					name?: string;
					version?: string;
					platform?: "ios" | "android";
				};
				info?: {
					name?: string;
					model?: string;
					osVersion?: string;
					platform?: "ios" | "android";
				};
			};
		};
	};
};

export const POCKETBASE_AUTH_KEY = "pocketbase_auth";

const authStore = new BaseAuthStore();

export const pb = new PocketBase(
	env.pocketBaseUrl || "http://127.0.0.1:8090",
	authStore,
);

pb.autoCancellation(false);

async function safeStorageGetItem(key: string) {
	try {
		const value = await AsyncStorage.getItem(key);
		logger.info({
			screen: "auth/storage",
			message: "read async storage",
			context: {
				key,
				hasValue: Boolean(value),
			},
		});
		return value;
	} catch (error) {
		logger.warn({
			screen: "auth/storage",
			message: "failed reading async storage",
			error,
		});
		return null;
	}
}

async function safeStorageSetItem(key: string, value: string) {
	try {
		await AsyncStorage.setItem(key, value);
		logger.info({
			screen: "auth/storage",
			message: "wrote async storage",
			context: {
				key,
				size: value.length,
			},
		});
	} catch (error) {
		logger.warn({
			screen: "auth/storage",
			message: "failed writing async storage",
			error,
		});
	}
}

async function safeStorageRemoveItem(key: string) {
	try {
		await AsyncStorage.removeItem(key);
		logger.info({
			screen: "auth/storage",
			message: "removed async storage value",
			context: { key },
		});
	} catch (error) {
		logger.warn({
			screen: "auth/storage",
			message: "failed removing async storage value",
			error,
		});
	}
}

export async function hydratePocketBaseAuthStore() {
	try {
		const rawValue = await safeStorageGetItem(POCKETBASE_AUTH_KEY);
		if (!rawValue) {
			logger.info({
				screen: "auth/storage",
				message: "no persisted auth state found",
			});
			return;
		}

		const parsed = JSON.parse(rawValue) as {
			token?: string;
			record?: AuthUserRecord;
			model?: AuthUserRecord;
		};

		authStore.save(
			parsed.token ?? "",
			(parsed.record ?? parsed.model ?? null) as any,
		);

		logger.info({
			screen: "auth/storage",
			message: "hydrated auth store from storage",
			context: {
				hasToken: Boolean(parsed.token),
				recordId: parsed.record?.id ?? parsed.model?.id,
			},
		});
	} catch (error) {
		logger.warn({
			screen: "auth/storage",
			message: "failed hydrating auth store from storage",
			error,
		});
		authStore.clear();
	}
}

export async function persistPocketBaseAuthState() {
	if (!authStore.token) {
		logger.debug({
			screen: "auth/storage",
			message: "persist skipped: missing token",
		});
		await safeStorageRemoveItem(POCKETBASE_AUTH_KEY);
		return;
	}

	const state = JSON.stringify({
		token: authStore.token,
		record: authStore.record,
	});

	await safeStorageSetItem(POCKETBASE_AUTH_KEY, state);
	logger.info({
		screen: "auth/storage",
		message: "persisted auth state",
		context: {
			recordId: (authStore.record as { id?: string } | null)?.id,
			tokenLength: authStore.token.length,
		},
	});
}

export function hasAdminAccess(role?: UserRole | null) {
	return role === "owner" || role === "admin";
}
