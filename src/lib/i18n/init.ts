import { setLocale, locales, baseLocale } from '$paraglide/runtime';
import { browser } from '$app/environment';

const COOKIE_NAME = 'locale';
const AVAILABLE_LOCALES = locales;
const DEFAULT_LOCALE = baseLocale;

type AvailableLanguageTag = typeof locales[number];

export function getCookie(name: string): string | null {
	if (!browser) return null;
	
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	
	if (parts.length === 2) {
		return parts.pop()?.split(';').shift() || null;
	}
	
	return null;
}

export function setCookie(name: string, value: string, days: number = 365): void {
	if (!browser) return;
	
	const expires = new Date();
	expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
	
	document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

export function getBrowserLanguage(): AvailableLanguageTag {
	if (!browser) return DEFAULT_LOCALE;
	
	const browserLang = navigator.language.split('-')[0];
	
	if (AVAILABLE_LOCALES.includes(browserLang as AvailableLanguageTag)) {
		return browserLang as AvailableLanguageTag;
	}
	
	return DEFAULT_LOCALE;
}

export function detectLanguage(): AvailableLanguageTag {
	const cookieLocale = getCookie(COOKIE_NAME);
	
	if (cookieLocale && AVAILABLE_LOCALES.includes(cookieLocale as AvailableLanguageTag)) {
		return cookieLocale as AvailableLanguageTag;
	}
	
	return getBrowserLanguage();
}

export function initializeLanguage(): void {
	if (!browser) return;
	
	const detectedLanguage = detectLanguage();
	setLocale(detectedLanguage);
	
	if (!getCookie(COOKIE_NAME)) {
		setCookie(COOKIE_NAME, detectedLanguage);
	}
}

export function switchLanguage(locale: AvailableLanguageTag): void {
	if (!AVAILABLE_LOCALES.includes(locale)) {
		console.warn(`Locale "${locale}" is not supported. Falling back to "${DEFAULT_LOCALE}".`);
		locale = DEFAULT_LOCALE;
	}
	
	setLocale(locale);
	setCookie(COOKIE_NAME, locale);
	
	if (browser) {
		window.location.reload();
	}
}
