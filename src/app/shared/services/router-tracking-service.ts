// route-tracking.service.ts
import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RouteTrackingService {
  private previousUrls: string[] = [];

  constructor(private router: Router) {
    this.loadPreviousUrls();
    this.router.events.
    subscribe((event: any) => {
        if (event instanceof NavigationEnd) {
          this.trackUrl(event.url);
        }

      });
  }

  private trackUrl(url: string) {
    // Add the current URL to the history
    this.previousUrls.push(url);

    // Keep only the last 10 URLs
    if (this.previousUrls.length > 10) {
      this.previousUrls.shift(); // Remove the oldest URL
    }

    // Save to localStorage
    localStorage.setItem('previousUrls', JSON.stringify(this.previousUrls));
  }

  private loadPreviousUrls() {
    const storedUrls = localStorage.getItem('previousUrls');
    if (storedUrls) {
      this.previousUrls = JSON.parse(storedUrls);
    }
  }

  getPreviousUrls(): string[] {
    return this.previousUrls;
  }

  getPreviousUrl(): string {
    return this.previousUrls[this.previousUrls.length - 2] || ''; // Second last URL
  }

  goToBackPage() {
    const previousUrl = this.getPreviousUrl();
    if (previousUrl.includes('/dashboard/home/work-orders')) {
      this.router.navigate(['/dashboard/home/work-orders']);
    }
    else if (previousUrl.includes('/dashboard/home/service-requests')) {
      this.router.navigate(['/dashboard/home/service-requests']);
    }
    else if (previousUrl.includes('/dashboard/home/permit-to-works')) {
      this.router.navigate(['/dashboard/home/permit-to-works']);
    }
    else {
      window.history.back();
    }
  }
}
