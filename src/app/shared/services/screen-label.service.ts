// src/app/shared/services/screen-label.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ICommonRequest } from '@shared/models/common-request';
import { HttpApi } from 'src/app/core/http/http-api';

export interface IScreenLabel {
  id: number;
  lbl_lang: string;
  lbl_name: string;
  lbl_value: string;
  menu_id: number | null;
  screen_name: string;
  submenu_id: number | null;
  created_date: string | null;
  created_by: number | null;
  updated_date: string | null;
  updated_by: number | null;
}

export interface IScreenLabelResponse {
  success: boolean;
  data: IScreenLabel[];
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScreenLabelService {
  // Simple cache for labels
  private labelsCache: Map<string, IScreenLabel[]> = new Map();

  constructor(private http: HttpClient) {}

  /**
   * Get screen labels as array
   * Request format: { "Params": [{ "Key": "ScreenName", "Value": "PURCHASE_ORDER" }, { "Key": "Lang", "Value": "en" }] }
   */
  getScreenLabels(screenName: string, lang: string): Observable<IScreenLabelResponse> {
    const cacheKey = `${screenName}_${lang}`;
    
    // Return cached data if available
    if (this.labelsCache.has(cacheKey)) {
      return of({
        success: true,
        data: this.labelsCache.get(cacheKey)!,
        count: this.labelsCache.get(cacheKey)!.length
      });
    }

    const request: ICommonRequest = {
      Params: [
        { key: 'ScreenName', value: screenName },
        { key: 'Lang', value: lang }
      ]
    };

    return this.http.post<IScreenLabelResponse>(
      HttpApi.getScreenLabels,
      request
    ).pipe(
      catchError(error => {
        console.error('Error fetching screen labels:', error);
        return of({ success: false, data: [], count: 0 });
      })
    );
  }

  /**
   * Clear cache for specific screen/lang or all cache
   */
  clearCache(screenName?: string, lang?: string): void {
    if (screenName && lang) {
      this.labelsCache.delete(`${screenName}_${lang}`);
    } else {
      this.labelsCache.clear();
    }
  }
}