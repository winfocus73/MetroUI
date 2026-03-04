import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'nxasm-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  title = 'shell';
  constructor(private router: Router) {
  }

  ngOnInit(): void {
    localStorage.clear();
    sessionStorage.clear();
  }

  onLoginPage() {
    this.router.navigate(['auth'])
  }
}
