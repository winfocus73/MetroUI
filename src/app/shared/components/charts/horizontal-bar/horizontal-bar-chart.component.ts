import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'nxasm-horizontal-bar-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './horizontal-bar-chart.component.html',
  styleUrls: ['./horizontal-bar-chart.component.scss'],
})
export class HorizontalBarChartComponent implements OnInit {
  @Input() data: any[] = [];
  @Input() total: number = 0;
  @Input() colorCode: string = '#00a65a';
  @Input() status!: string;
  @Input() unit!: number;
  @Input() skipPercentage: boolean = false;
  @Output() clickedData =  new EventEmitter();
  margin: any = { top: 30, right: 20, bottom: 30, left: 10 };
  width: number = 500 - this.margin.left - this.margin.right;
  height = 200 - this.margin.top - this.margin.bottom;
  hostElement:any;

  constructor(private elRef: ElementRef) {
    this.hostElement = this.elRef.nativeElement;
}

  ngOnInit() {
    if(this.data)
    this.createSVGElement();
  }
  barClickdData() {
    const data = {
      status: this.status,
      unit: this.unit
    }
    this.clickedData.emit(data);
  }
  createSVGElement() {
    // Create the SVG element
    let svg = d3.select(this.hostElement)
      .select('#chart_div')
      .append('svg')
      //.attr('width', this.width + this.margin.left + this.margin.right)
      //.attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      );

    // Define the x-scale and y-scale
    let x = d3
      .scaleLinear()
      .range([0, this.width])
      .domain([
        0,
        d3.max(this.data,  (d)=> {
          return d;
        }),
      ]);

    let y = d3
      .scaleBand()
      .range([this.height, 0])
      .padding(0.1)
      .domain(
        this.data.map( (d, i)=> {
          return d;
        })
      );
      this.appendlines(svg,x,y);
  }

  appendlines(svg:any,x:any,y:any){

    // Append the bars for likes
    let barGroup = svg.selectAll(".likesGroup")
    .data(this.data)
    .enter()
    .append("g")
    .attr("class", "likesGroup");
    if(y(0))
    barGroup.attr("transform", (d:any, i:any)=> {  return "translate(0," + y + ")"; });

    let percentage=(this.data[0]/this.total)*100;
    barGroup.append("rect")
    .attr("class", "bar barLikes")
    .attr("y", 0)
    .attr("height",  y.bandwidth() / 2)
    .attr("x", 0)
    .attr("width", (percentage)*3)
    .attr("fill", this.colorCode);

    barGroup.append("text")
    .attr("class", "dataLabel likesLabel")
    .text((d:any)=> { return d; })
    .attr("x", 20) // Adjust the x position as needed
    .attr("y", 35) // Adjust the y position as needed
    .style("font-size", "20px")
    .style("fill", "#C81E1E");
    if(!this.skipPercentage){
    barGroup.append("text")
    .attr("class", "dataLabel likesLabel")
    .text((percentage?percentage.toFixed(1):0)+'%')
    .attr("x", 150) // Adjust the x position as needed
    .attr("y", 35) // Adjust the y position as needed
    .style("font-size", "20px");
    }

  }
}
