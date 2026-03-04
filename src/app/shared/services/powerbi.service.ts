// powerbi.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

declare var powerbi: any;

@Injectable({
  providedIn: 'root'
})
export class PowerBiService {
  private embedToken!: string;

  constructor(private router: Router, private http: HttpClient) { }

  // Authenticate and get embed token
  authenticate(username: string, password: string): void {
    const body = { username, password };
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    this.http.post<any>('YOUR_AUTHENTICATION_ENDPOINT', body, { headers }).subscribe(
      data => {
        this.embedToken = data.embedToken;
        this.embedReport();
      },
      error => {
        console.error('Authentication failed:', error);
      }
    );
  }

  // Embed Power BI report
  private embedReport(): void {
    const config = {
      type: 'report',
      id: 'YOUR_REPORT_ID',
      embedUrl: 'YOUR_REPORT_EMBED_URL',
      accessToken: this.embedToken,
      tokenType: 'Embed'
    };

    const reportContainer = <HTMLElement>document.getElementById('reportContainer');

    const report = powerbi.embed(reportContainer, config);

    report.off('loaded');
    report.on('loaded', () => {
      console.log('Report is loaded');
    });

    report.off('error');
    report.on('error', (error: any) => {
      console.error('Report embedding error:', error);
    });
  }
}
