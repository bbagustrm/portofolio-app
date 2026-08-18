import type { Cookies } from '@sveltejs/kit';
import { locales, baseLocale } from '$paraglide/runtime';

type AvailableLanguageTag = typeof locales[number];

const COOKIE_NAME = 'locale';
const AVAILABLE_LOCALES = locales;
const DEFAULT_LOCALE = baseLocale;

export function getLocaleFromCookies(cookies: Cookies): AvailableLanguageTag {
	const cookieLocale = cookies.get(COOKIE_NAME);
	
	if (cookieLocale && AVAILABLE_LOCALES.includes(cookieLocale as AvailableLanguageTag)) {
		return cookieLocale as AvailableLanguageTag;
	}
	
	return DEFAULT_LOCALE;
}

export function getLocaleFromRequest(request: Request): AvailableLanguageTag {
	const acceptLanguage = request.headers.get('accept-language');
	
	if (!acceptLanguage) return DEFAULT_LOCALE;
	
	const browserLang = acceptLanguage.split(',')[0].split('-')[0];
	
	if (AVAILABLE_LOCALES.includes(browserLang as AvailableLanguageTag)) {
		return browserLang as AvailableLanguageTag;
	}
	
	return DEFAULT_LOCALE;
}
