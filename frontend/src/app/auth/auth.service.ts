import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { AppState, InitState, SigninResponse, SignupResponse, User } from './types';
import { environment } from '../environments/environment';
import { ThemeServiceService } from '../theme/theme-service.service';
import { LangService } from '../lang/lang.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #http = inject(HttpClient);
  #themeService = inject(ThemeServiceService);
  #langService = inject(LangService);
  appState = signal<AppState>(InitState);

  signup(user: User) {
    return this.#http.post<SignupResponse>(environment.backend_URL + '/api/auth/signup', user);
  }

  verifyAccount(email: string) {
    return this.#http.post<{ success: boolean; message: string }>(
      environment.backend_URL + '/api/auth/verifyAccount',
      { email: email }
    );
  }

  signin(user: { email: string; password: string }) {
    return this.#http.post<SigninResponse>(environment.backend_URL + '/api/auth/signin', user);
  }

  refreshToken(refreshToken: string) {
    return this.#http.post<{ success: boolean; data: { accessToken: string; refreshToken: string } }>(
      environment.backend_URL + '/api/auth/refresh',
      { refreshToken }
    );
  }

  constructor() {
    effect(() => {
      const state = this.appState();
      localStorage.setItem('APP_STATE', JSON.stringify(state));

      if (!state.accessToken) {
        this.#themeService.setTheme('light');
        this.#langService.setLang('en');
        localStorage.clear();
        return;
      }

      const theme = state.user?.theme === 'dark' ? 'dark' : 'light';
      this.#themeService.setTheme(theme);

      const lang = state.user?.language === 'vi' ? 'vi' : 'en';
      this.#langService.setLang(lang);
    });
  }

  isLoggedin() {
    return this.appState().accessToken ? true : false;
  }

  isAdmin() {
    const user = this.appState().user;
    return user?.role === 'Admin';
  }
}
