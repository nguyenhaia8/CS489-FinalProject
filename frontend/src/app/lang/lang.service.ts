import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppState } from '../auth/types';
import translationEN from '../../../public/i18n/en.json';
import translationVI from '../../../public/i18n/vi.json';

@Injectable({
  providedIn: 'root',
})
export class LangService {
  private readonly defaultLang: 'en' | 'vi' = 'en';
  #translate = inject(TranslateService);

  setLang(lang: 'en' | 'vi') {
    this.#translate.use(lang);
  }

  loadLang() {
    try {
      const rawState = localStorage.getItem('APP_STATE');
      if (!rawState) {
        this.setLang(this.defaultLang);
        return;
      }

      const appState = JSON.parse(rawState) as AppState | null;
      const lang = appState?.user?.language === 'vi' ? 'vi' : this.defaultLang;
      this.setLang(lang);
    } catch (error) {
      console.error('Failed to load theme from app state:', error);
      this.setLang(this.defaultLang);
    }
  }

  constructor() {
    this.#translate.setTranslation('en', translationEN);
    this.#translate.setTranslation('vi', translationVI);
  }
}
