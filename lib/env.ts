import Constants from "expo-constants";

type RuntimeConfig = {
	POCKET_BASE_URL?: string;
	EXPO_PUBLIC_POCKET_BASE_URL?: string;
};

function readRuntimeConfig(): RuntimeConfig {
	const extra = (Constants.expoConfig?.extra ?? {}) as RuntimeConfig;

	return {
		...extra,
		POCKET_BASE_URL: process.env.POCKET_BASE_URL ?? extra.POCKET_BASE_URL,
		EXPO_PUBLIC_POCKET_BASE_URL: process.env.EXPO_PUBLIC_POCKET_BASE_URL ??
			extra.EXPO_PUBLIC_POCKET_BASE_URL,
	};
}

const runtimeConfig = readRuntimeConfig();

export const env = {
	pocketBaseUrl: runtimeConfig.POCKET_BASE_URL ??
		runtimeConfig.EXPO_PUBLIC_POCKET_BASE_URL ??
		"",
};

export const envFlags = {
	hasPocketBaseUrl: Boolean(env.pocketBaseUrl),
};
