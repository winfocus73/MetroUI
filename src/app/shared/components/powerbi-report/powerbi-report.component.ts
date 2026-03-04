import { Component, Sanitizer } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { PowerBiService } from '@shared/services/powerbi.service';

@Component({
  selector: 'app-powerbi-report',
  templateUrl: './powerbi-report.component.html',
  styleUrls: ['./powerbi-report.component.scss']
})
export class PowerbiReportComponent {
  username: string =''
  password: string= ''
  url = 'https://www.youtube.com/embed/eI4an8aSsgw';
  unsafeHtmlContent = `<iframe src="https://ngl-rapp-001/Reports/powerbi/AMS%20Reports/SR%20Reports/Service%20Request" width="100%" height="600px" frameborder="0" scrolling="auto"></iframe>`
  safeHtmlContent!:any;
  safeUrl!:any;
  constructor(private powerBiService: PowerBiService, private sanitizer: DomSanitizer) {
    this.url = 'https://ngl-rapp-001/Reports/powerbi/AMS%20Reports/SR%20Reports/Service%20Request'

    this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.unsafeHtmlContent);
  }

  authenticate(): void {
    this.powerBiService.authenticate(this.username, this.password);
  }

  getUrl(): any{

    this.safeUrl =  this.sanitizer.bypassSecurityTrustUrl(this.url);
    //sanitizer.bypassSecurityTrustUrl(this.dangerousUrl);

  }

  getReportUrl(): string {
    const reportId = 'powerbi/Stationwisemediatypesummary';
    const baseUrl = 'https://nxasm.winfocus.co.in/Reports';
    const username = this.username;
    const password = this.password;
    const base64Credentials = btoa(`${username}:${password}`);

    // Construct the URL with the embed token and other parameters
    const url = `${baseUrl}/${reportId}/?rs:embed=true`;

    // Include the base64-encoded username and password combination in the query string
    const fullUrl = `${url}&username=${username}&password=${password}`;

    return fullUrl;

  }

}
