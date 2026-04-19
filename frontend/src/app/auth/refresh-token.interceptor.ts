import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { InitState } from './types';

const refreshBypassEndpoints = ['/api/auth/signin', '/api/auth/signup', '/api/auth/refresh'];

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const shouldBypass = refreshBypassEndpoints.some((endpoint) => req.url.includes(endpoint));
  if (shouldBypass) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check if error is 401 (Unauthorized) - token expired
      if (error.status === 401) {
        const refreshToken = authService.appState().refreshToken;

        if (!refreshToken) {
          authService.appState.set(InitState);
          return throwError(() => error);
        }

        // Try to refresh token
        return authService.refreshToken(refreshToken).pipe(
          switchMap((response) => {
            if (response.success && response.data) {
              // Update tokens in appState
              const currentState = authService.appState();
              authService.appState.set({
                ...currentState,
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken,
              });

              // Retry the original request with new token
              const clonedReq = req.clone({
                headers: req.headers.set('Authorization', 'Bearer ' + response.data.accessToken),
              });
              return next(clonedReq);
            } else {
              authService.appState.set(InitState);
              return throwError(() => error);
            }
          }),
          catchError((refreshError) => {
            authService.appState.set(InitState);
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
