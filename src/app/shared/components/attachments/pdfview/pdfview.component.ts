
//import * as R from 'ramda';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-pdfview',
  templateUrl: './pdfview.component.html',
  styleUrls: ['./pdfview.component.scss']
})
export class PdfviewComponent implements OnInit {
  src = '';
  page = 1;
  pdf: any;
  cpage = 0;
  pageRead: any;
  type!: string;

  constructor(
    public dialogRef: MatDialogRef<PdfviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.src = data.url;
     this.type = data.type;
  }

  ngOnInit() {

  }

  

  render() {
    this.watermark();
  }

  pageRendered(e: CustomEvent) {
    this.watermark();
  }

  watermark() {
    var can = document.querySelector('canvas');
    if(can) {
        var ctx = can.getContext("2d");
        if(ctx) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.font = "30px Arial";
            for (var i = 0; i < 100; i++) {
            for (var j = 0; j < 100; j++) {
                ctx.strokeText("Sample Only", 300 * i, 200 * j)
            }
            }
        }
    }

  }



  update() {
    this.pageRead[this.page - 1] = true;
    this.cpage = this.page;
    this.watermark();
  }

//   callBackFn(pdf: any) {
//     // do anything with "pdf"
//     this.pdf = pdf;
//     this.pageRead = R.range(0, pdf.numPages).map(() => false)
//     this.pageRead[0] = true;
//   }


  readAllPages() {
    return this.pageRead.filter((x: any) => !x).length != 0;
  }
  onNoClick() {
    this.dialogRef.close();
  }



}