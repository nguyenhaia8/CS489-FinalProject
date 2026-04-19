import { Injectable } from '@angular/core';
import { AppState } from '../auth/types';

@Injectable({
  providedIn: 'root',
})
export class ThemeServiceService {
  private readonly defaultTheme: 'light' | 'dark' = 'light';

  setTheme(theme: 'light' | 'dark') {
    document.documentElement.setAttribute('data-theme', theme);
  }

  loadTheme() {
    try {
      const rawState = localStorage.getItem('APP_STATE');
      if (!rawState) {
        this.setTheme(this.defaultTheme);
        return;
      }

      const appState = JSON.parse(rawState) as AppState | null;
      const theme = appState?.user?.theme === 'dark' ? 'dark' : this.defaultTheme;
      this.setTheme(theme);
    } catch (error) {
      console.error('Failed to load theme from app state:', error);
      this.setTheme(this.defaultTheme);
    }
  }
  constructor() {}
}
