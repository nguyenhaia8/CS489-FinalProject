import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  #http = inject(HttpClient);

  updateProfile(data: { theme: string; language: string }) {
    return this.#http.post<{ success: boolean; message: string }>(
      environment.backend_URL + '/api/auth/updateProfile',
      data
    );
  }
}
