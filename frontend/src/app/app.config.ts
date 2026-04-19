import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { ThemeServiceService } from './theme/theme-service.service';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthService } from './auth/auth.service';
import { AppState } from './auth/types';
import { addTokenInterceptor } from './auth/add-token.interceptor';
import { refreshTokenInterceptor } from './auth/refresh-token.interceptor';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LangService } from './lang/lang.service';

function initState() {
  try {
    const authService = inject(AuthService);
    const local = localStorage.getItem('APP_STATE');
    if (local) {
      const localJSON = JSON.parse(local) as AppState;
      if (localJSON.accessToken) {
        authService.appState.set(localJSON);
      }
    }
  } catch (error) {
    console.error('Failed to initialize app state:', error);
    localStorage.removeItem('APP_STATE');
  }
}

function initTheme() {
  try {
    const themeService = inject(ThemeServiceService);
    themeService.loadTheme();
  } catch (error) {
    console.error('Failed to initialize theme:', error);
  }
}

function initLang() {
  try {
    const langService = inject(LangService);
    langService.loadLang();
  } catch (error) {
    console.error('Failed to initialize lang:', error);
  }
}

const httpLoaderFactory: (http: HttpClient) => TranslateHttpLoader = (http: HttpClient) =>
  new TranslateHttpLoader();

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAppInitializer(initState),
    provideAppInitializer(initTheme),
    provideAppInitializer(initLang),
    provideHttpClient(withInterceptors([addTokenInterceptor, refreshTokenInterceptor])),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: () => httpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
};
