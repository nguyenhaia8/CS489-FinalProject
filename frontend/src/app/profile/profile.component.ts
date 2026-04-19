import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ThemeServiceService } from '../theme/theme-service.service';
import { ProfileService } from './profile.service';
import { LangService } from '../lang/lang.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, TranslatePipe],
  template: `
    <section class="profile-page">
      <header>
        <h2>{{ 'profile.title' | translate }}</h2>
      </header>

      <div class="card">
        <div class="info-row">
          <div class="info-block">
            <label>Username</label>
            <div class="info-value">{{ user().username || '-' }}</div>
          </div>

          <div class="info-block">
            <label>Email</label>
            <div class="info-value">{{ user().email || '-' }}</div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="toggle-row">
          <div class="toggle-text">
            <h3>Theme</h3>
            <small>{{ theme() === 'dark' ? 'Dark mode' : 'Light mode' }}</small>
          </div>
          <label class="switch">
            <input
              type="checkbox"
              [checked]="theme() === 'dark'"
              (change)="onThemeToggle($event)"
            />
            <span class="slider"></span>
          </label>
        </div>

        <div class="toggle-row">
          <div class="toggle-text">
            <h3>{{ 'profile.language' | translate }}</h3>
            <small>{{ language() === 'vi' ? 'Vietnamese' : 'English' }}</small>
          </div>
          <label class="switch">
            <input
              type="checkbox"
              [checked]="language() === 'vi'"
              (change)="onLanguageToggle($event)"
            />
            <span class="slider"></span>
          </label>
        </div>

        <button
          class="update-btn"
          (click)="updateProfile()"
          [disabled]="isUpdating()"
          [aria-busy]="isUpdating()"
        >
          {{ isUpdating() ? ('profile.updating' | translate) : ('profile.update' | translate) }}
        </button>
      </div>
    </section>
  `,
  styles: `
    .profile-page {
      max-width: 640px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
      color: #18181b;
    }

    .profile-page header h2 {
      margin: 0;
      font-size: 32px;
      color: white;
      font-family: 'Montserrat';
    }

    .profile-page header p {
      margin: 8px 0 0;
      color: #6b7280;
    }

    .card {
      background: #ffffff;
      border-radius: 18px;
      padding: 32px;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .info-row {
      display: flex;
      gap: 32px;
      flex-wrap: wrap;
    }

    .info-block {
      flex: 1;
      min-width: 200px;
    }

    .info-block label {
      display: block;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 8px;
    }

    .info-value {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
    }

    .divider {
      border-top: 1px solid rgba(148, 163, 184, 0.4);
    }

    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .toggle-text h3 {
      margin: 0;
      font-size: 18px;
      color: #0f172a;
    }

    .toggle-text small {
      color: #94a3b8;
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 32px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #cbd5f5;
      transition: 0.4s;
      border-radius: 34px;
    }

    .slider::before {
      position: absolute;
      content: '';
      height: 24px;
      width: 24px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
      box-shadow: 0 3px 6px rgba(15, 23, 42, 0.2);
    }

    .switch input:checked + .slider {
      background-color: #111827;
    }

    .switch input:checked + .slider::before {
      transform: translateX(28px);
    }

    .update-btn {
      align-self: flex-end;
      padding: 12px 32px;
      border-radius: 999px;
      border: none;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .update-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      box-shadow: none;
    }

    .update-btn:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px rgba(99, 102, 241, 0.4);
    }
  `,
})
export class ProfileComponent {
  #authService = inject(AuthService);
  #profileService = inject(ProfileService);
  #themeService = inject(ThemeServiceService);
  #langService = inject(LangService);

  user = computed(() => this.#authService.appState().user);
  theme = signal<'light' | 'dark'>('light');
  language = signal<'en' | 'vi'>('en');
  isUpdating = signal(false);

  constructor() {
    effect(() => {
      const user = this.user();
      this.theme.set((user.theme as 'light' | 'dark') || 'light');
      this.language.set((user.language as 'en' | 'vi') || 'en');
    });
  }

  onThemeToggle(event: Event) {
    const input = event.target as HTMLInputElement;
    const updateTheme: 'light' | 'dark' = input.checked ? 'dark' : 'light';
    if (this.theme() === updateTheme) {
      return;
    }
    this.theme.set(updateTheme);
    this.#themeService.setTheme(updateTheme);
    this.#syncUserState({ theme: updateTheme });
  }

  onLanguageToggle(event: Event) {
    const input = event.target as HTMLInputElement;
    const updateLanguage: 'en' | 'vi' = input.checked ? 'vi' : 'en';
    if (this.language() === updateLanguage) {
      return;
    }
    this.language.set(updateLanguage);
    this.#langService.setLang(updateLanguage);
    this.#syncUserState({ language: updateLanguage });
  }

  updateProfile() {
    if (this.isUpdating()) {
      return;
    }

    this.isUpdating.set(true);
    this.#profileService
      .updateProfile({
        theme: this.theme(),
        language: this.language(),
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            window.alert('Updated profile');
          } else {
            window.alert('Update profile failed!');
          }
          this.isUpdating.set(false);
        },
        error: () => {
          this.isUpdating.set(false);
          window.alert('Update profile failed!');
        },
      });
  }

  #syncUserState(partial: Partial<{ theme: string; language: string }>) {
    const current = this.#authService.appState();
    this.#authService.appState.set({
      ...current,
      user: {
        ...current.user,
        ...partial,
      },
    });
  }
}
