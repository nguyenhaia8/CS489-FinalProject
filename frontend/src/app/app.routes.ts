import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';

export const routes: Routes = [
  {
    path: 'signin',
    loadComponent: () => import('./auth/signin.component').then((c) => c.SigninComponent),
    title: 'Sign In',
  },
  {
    path: 'signup',
    loadComponent: () => import('./auth/signup.component').then((c) => c.SignupComponent),
    title: 'Sign Up',
  },
  {
    path: 'learning',
    loadComponent: () => import('./learning/learning.component').then((c) => c.LearningComponent),
    title: 'Learning',
    canActivate: [() => inject(AuthService).isLoggedin],
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then((c) => c.ProfileComponent),
    title: 'Profile',
    canActivate: [() => inject(AuthService).isLoggedin],
  },
  {
    path: 'history',
    loadComponent: () => import('./history/history.component').then((c) => c.HistoryComponent),
    title: 'History',
    canActivate: [() => inject(AuthService).isLoggedin],
  },
  {
    path: 'manage',
    loadComponent: () => import('./manage/manage.component').then((c) => c.ManageComponent),
    title: 'Manage',
    canActivate: [
      () => {
        const authService = inject(AuthService);
        const router = inject(Router);
        if (!authService.isLoggedin()) {
          router.navigate(['/signin']);
          return false;
        }
        if (!authService.isAdmin()) {
          router.navigate(['/learning']);
          return false;
        }
        return true;
      },
    ],
  },

  { path: '**', redirectTo: 'learning' },
];
