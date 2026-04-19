import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const addTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  if (authService.appState().accessToken) {
    const reqWithToken = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + authService.appState().accessToken),
    });

    return next(reqWithToken);
  } else {
    return next(req);
  }
};
