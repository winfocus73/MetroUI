

import {
    Component,
    Input,
    ViewChild,
    ElementRef,
    OnChanges,
    SimpleChanges,
    AfterViewInit,
    OnDestroy,
    Output,
    EventEmitter,
  } from '@angular/core';
import * as d3 from 'd3';
  
  import {
    select,
    pie,
    interpolate,
    hsl,
    selectAll,
    arc,
  } from 'd3';
  
  
  const ANIME_DURATION = 1.5;
  const FONT_SIZE = '10px';
  const SLICE_ANIME = 'transform 0.5s ease-in-out';
  @Component({
    selector: 'nxasm-pie-chart',
    template: '<div class="chart" #chartContainer></div>',
  })
  export class PiechartComponent implements OnChanges, OnDestroy, AfterViewInit {
  
    @ViewChild('chartContainer') chartContainer?: ElementRef;
  
    // Heading
    @Input()
    heading = 'Chart';
  
    @Input()
    type = 'PIE'; // [DOUGHNUT, PIE]
  
    // Main size of the Chart boundary/outerbound
    @Input()
    size: { width: number, height: number } = { width: 1850, height: 1850 };
  
    // raw data passed
    @Input()    data: any[] = [];
    @Input() colorCodes: string[]=[];
    @Output()
    selected: EventEmitter<any> = new EventEmitter<any>();
  
    id: string|null = null; // identifier for the chart make sure all clases have it
  
    private svg: any;
    private margin:any = { top: 5, right: 5, bottom: 5, left: 5 };
    private workarea:any= { width: 0, height: 0 };
    private dimensions:any = null; // { center: { x: 150, y: 150 }, radius: { x: 130, y: 100, z: 0 }, height: 20 };
    private interpolators:any = {};
    private showLegends = true;
    colorScale:any; // D3 color provider
    constructor() { }
  
    ngAfterViewInit(): void {
      this.id = `__${Math.floor(Math.random() * 5e10)}`;
      this.init();
      if (this.data && this.data.length >= 0) {
        this.draw(this.data);
      }
    }
  
    ngOnChanges(changes: SimpleChanges): void {
     // if (this.id) {
        const { data, size } = changes;
        if (data && data.currentValue && data.currentValue.length >= 0) {
          this.data = data.currentValue;
          this.draw(this.data);
        }
        if (size && size.currentValue) {
          this.size = size.currentValue;
          this.init();
          this.draw(this.data);
        }
     // }
    }
  
    ngOnDestroy(): void {
      this.chartContainer?.nativeElement.remove();
    }
  
    /**
     * Initialize the chart container with axis information and basic variables
     */
    private init(): void {
      this.workarea = {
        width: this.size.width - this.margin.left - this.margin.right,
        height: this.size.height - this.margin.top - this.margin.bottom,
      };
      this.dimensions = {
        center: {
          x: this.workarea.width / 2,
          y: this.workarea.height / 2,
        },
        radius: {
          x: this.workarea.width / 2 - 30,
          y: this.workarea.height / 2 - 30,
          z: this.type === 'DOUGHNUT' ? 0.7 : 0,
        },
        height: 10, // 3d Height
      };
      select(this.chartContainer?.nativeElement).select('svg').remove();
      this.svg = select(this.chartContainer?.nativeElement)
        .append('svg')
        //.attr('xmlns', 'http://www.w3.org/2000/svg')
        //.attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
        .attr('width', this.workarea.width + this.margin.left + this.margin.right)
        .attr('height', this.workarea.height + this.margin.top + this.margin.bottom)
        .style('font-size', FONT_SIZE);
  
      this.svg
        .append('g')
        .attr('transform', 'translate(' + this.dimensions.center.x + ',' + this.dimensions.center.y + ')')
        .attr('class', `slices${this.id}`);
    }
  
    /**
     * Main method to create a chart
     * @param rawData pass data to draw
     */
    private draw(rawData: any[]): void {
      this.drawData(rawData);
      if (this.showLegends) {
        this.drawLegends(rawData);
      }
      this.drawMouseEvents();
    }
  
    /**
     * Helper method to draw the pie
     * @param rawData pass data to draw
     */
    private drawData(rawData: any[]): void {
      const data = pie().sort(null).value((d: any) => d.Count)(rawData);
      const { height, radius } = this.dimensions ? this.dimensions : '';
      const slices = this.svg.select(`.slices${this.id}`);
        this.setColorScale();
      // Inner Slices Enter/Update/Remove (for DOUGHNUTS)
      const innerSliceUpdate = slices.selectAll(`.innerSlice${this.id}`).data(data);
      const innerSliceEnter = innerSliceUpdate.enter().append('path').attr('class', `innerSlice${this.id}`);
      innerSliceUpdate.exit().remove();
      innerSliceEnter
        .style('fill', (datum:any, index:any) => {
            return this.colorScale(`${index}`);
        })
        .style('transition', SLICE_ANIME)
        .attr('d', (d:any) => this.pieInner(d, radius.x + 0.5, radius.y + 0.5, radius.z, height))
        .each((d:any) => { this.interpolators[d.data.Label] = d; });
      innerSliceUpdate
        .transition().duration(ANIME_DURATION * 1e3)
        .attrTween('d', (d:any) => (t:any, i = this.interpolatorFn(d)(t)) => this.pieInner(i, radius.x + 0.5, radius.y + 0.5, radius.z, height));
  
      // Top Slices Enter/Update/Remove (facing up x/y axis)
      const topSliceUpdate = slices.selectAll(`.topSlice${this.id}`).data(data);
      const topSliceEnter = topSliceUpdate.enter().append('path').attr('class', `topSlice${this.id}`);
      topSliceUpdate.exit().remove();
  
      topSliceEnter
        .style('fill', (datum:any, index:any) => {
            return this.colorScale(`${index}`);
        })
        .style('stroke', (datum:any, index:any) => {
            return this.colorScale(`${index}`);
        })
        .style('transition', SLICE_ANIME)
        .attr('d', (d:any) => this.pieTop(d, radius.x, radius.y, radius.z))
        .each((d:any) => { this.interpolators[d.data.Label] = d; });
      topSliceUpdate
        .transition().duration(ANIME_DURATION * 1e3)
        .attrTween('d', (d:any) => (t:any, i = this.interpolatorFn(d)(t)) => this.pieTop(i, radius.x, radius.y, radius.z));
  
      // Outer Slices Enter/Update/Remove (3d effect z axis)
      const outerSliceUpdate = slices.selectAll(`.outerSlice${this.id}`).data(data);
      const outerSliceEnter = outerSliceUpdate.enter().append('path').attr('class', `outerSlice${this.id}`);
      outerSliceUpdate.exit().remove();
  
      outerSliceEnter
        .style('fill', (datum:any, index:any) => {
            return this.colorScale(`${index}`);
        })
        .style('transition', SLICE_ANIME)
        .attr('d', (d:any) => this.pieOuter(d, radius.x - .5, radius.y - .5, height))
        .each((d:any) => { this.interpolators[d.data.Label] = d; });
      outerSliceUpdate
        .transition().duration(ANIME_DURATION * 1e3)
        .attrTween('d', (d:any) => (t:any, i = this.interpolatorFn(d)(t)) => this.pieOuter(i, radius.x - .5, radius.y - .5, height));
  
      // Percentage labels Enter/Update/Remove
      const percentUpdate = slices
        .selectAll(`.percent${this.id} text`)
        .data(data);
      const percentEnter = percentUpdate
        .enter()
        .append('g')
        .attr('class', `percent${this.id}`)
        .style('transition', SLICE_ANIME)
        .style('pointer-events', 'none')
        .append('text');
      percentUpdate.exit().remove();
  
      percentEnter
      //.attr("x", "5%")
      //.attr("y", "5%")
        .attr('x', (d:any) => 0.6 * radius.x * Math.cos(0.5 * (d.startAngle + d.endAngle)))
        .attr('y', (d:any) => 0.6 * radius.y * Math.sin(0.5 * (d.startAngle + d.endAngle)))
        .transition().duration(ANIME_DURATION * 1e3)
        .text((d:any) => d.data.Count || '')
         .text((d:any) => this.getPercent(d))
         .attr('fill', (datum:any, index:any) => {
            return this.colorScale(`${index}`);
        })
        .attr('fill', '#fff')
        .style('font-size', '150%')
        .each((d:any) => { this.interpolators[d.data.Label] = d; });
      

      percentUpdate
        .transition().duration(ANIME_DURATION * 1e3)
        .attrTween('x', (d:any)=> (t:any, i = this.interpolatorFn(d)(t)) => `${(0.6 * radius.x * Math.cos(0.5 * (i.startAngle + i.endAngle)))}`)
        .attrTween('y', (d:any)=> (t:any, i = this.interpolatorFn(d)(t)) => `${(0.6 * radius.x * Math.sin(0.5 * (i.startAngle + i.endAngle)))}`)
        .text((d:any) => d.data.Count || '')
       .text((d:any) => this.getPercent(d));
    }
  
    /**
     * Draw legends for the chart
     * @param rawData Data based on legends to be drawn
     */
    private drawLegends(rawData:any): void {
      selectAll(`.legends${this.id}`).remove(); // Unnecessary fixed keeps the first
      const updateLegends = this.svg.selectAll(`.legends${this.id}`)
        .data(rawData);
      const enterLegends = updateLegends.enter().append('g')
        .attr('class', `legends${this.id}`);
      updateLegends.exit().remove();
  
      enterLegends.append('circle')
        .attr('class', `legend${this.id}`)
        .attr('transform', (d:any, i:number) => `translate(${this.workarea.width - 50} ${i * 10})`)
        .attr('stroke', '#000')
        .attr('r', 4)
        .attr('cx', -35)
        .attr('cy', 10)
        .style('text-transform', 'capitalize')
        .style('fill', (datum:any, index:any) => {
            return this.colorScale(`${index}`);
        });
      enterLegends.append('text')
        .attr('x', this.workarea.width - 80)
        .attr('y', (d:any, i:number) => (i * 10) + 13)
        .text((d:any) => d.Value)
        .style('fill', (datum:any, index:any) => {
            return this.colorScale(`${index}`);
        })
        .style('text-shadow', '0px 1px 10px #000');
      updateLegends.select(`.legend${this.id}`)
        .style('fill', (datum:any, index:any) => {
            return this.colorScale(`${index}`);
        });
      updateLegends.select(`.legend${this.id}`).select('text')
        .text((d:any) => d.Label);
    }
  
    private setColorScale() {
        this.colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        // Below is an example of using custom colors
         // this.colorScale = d3.scaleOrdinal().domain(["0","1","2","3"]).range(['#DFFF00', '#FFBF00', '#FF7F50', '#DE3163']);
        if(this.colorCodes.length>0){
           const values= this.colorCodes.map((value, index) => (index.toString()));
           this.colorScale = d3.scaleOrdinal().domain(values).range(this.colorCodes);
        }
       
    }
    /**
     * Draw mouse event handling
     */
    private drawMouseEvents(): void {
      const slices = this.svg.select(`.slices${this.id}`);
      const innerSlices = slices.selectAll(`.innerSlice${this.id}`).nodes() || [];
      const topSlices = slices.selectAll(`.topSlice${this.id}`).nodes() || [];
      const outerSlices = slices.selectAll(`.outerSlice${this.id}`).nodes() || [];
      const percentSlices = slices.selectAll(`.percent${this.id}`).nodes() || [];
      slices.selectAll(`.topSlice${this.id}`)
        .on('mouseover', (_:any, data:any) => {
          const idx = data.index;
          [innerSlices[idx], topSlices[idx], outerSlices[idx], percentSlices[idx]].forEach(v => {
            select(v).style('transform', this.explode(data));
          });
        })
        .on('mouseout', (_:any, data:any) => {
          const idx = data.index;
          [innerSlices[idx], topSlices[idx], outerSlices[idx], percentSlices[idx]].forEach(v => {
            select(v).style('transform', 'translate(0, 0) scale(1)');
          });
        })
        .on('click', (_:any, data:any) => {
          this.selected.emit(data.data);
        });
    }
  
    /**
     * Gets a translated value for the current data to explode pie on hover
     * @param data data
     * @param index index
     */
    explode(data:any): string {
      const offset = 5;
      const angle = (data.startAngle + data.endAngle) / 2;
      const xOff = Math.cos(angle) * offset;
      const yOff = Math.sin(angle) * offset;
      return `translate(${xOff}px, ${yOff}px) scale(1.1)`;
    }
  
    /**
     * Custom interpolator
     * @param d data
     */
    private interpolatorFn(d:any): any {
      const iFn = interpolate(this.interpolators[d.data.Label], d);
      this.interpolators[d.data.Label] = iFn(0);
      return iFn;
    }
  
  
    /**
     * Helper to draw pieTopSlice
     * @param d data
     * @param rx radius X
     * @param ry radius Y
     * @param rz radius Z
     */
    private pieTop(d:any, rx:number, ry:number, rz:number): string {
      if (d.endAngle - d.startAngle === 0) {
        return 'M 0 0';
      }
      const sx = rx * Math.cos(d.startAngle);
      const sy = ry * Math.sin(d.startAngle);
      const ex = rx * Math.cos(d.endAngle);
      const ey = ry * Math.sin(d.endAngle);
  
      return ['M', sx, sy, 'A', rx, ry, '0', (d.endAngle - d.startAngle > Math.PI ? 1 : 0), '1', ex, ey, 'L', rz * ex, rz * ey]
        .concat(['A', rz * rx, rz * ry, '0', (d.endAngle - d.startAngle > Math.PI ? 1 : 0), '0', rz * sx, rz * sy, 'z'])
        .join(' ');
    }
  
    /**
     * Helper to draw pieOuterSlice
     * @param d data
     * @param rx radius X
     * @param ry radius Y
     * @param h height
     */
    private pieOuter(d:any, rx:number, ry:number, h:number): string {
      const startAngle = (d.startAngle > Math.PI ? Math.PI : d.startAngle);
      const endAngle = (d.endAngle > Math.PI ? Math.PI : d.endAngle);
  
      const sx = rx * Math.cos(startAngle);
      const sy = ry * Math.sin(startAngle);
      const ex = rx * Math.cos(endAngle);
      const ey = ry * Math.sin(endAngle);
  
      return ['M', sx, h + sy, 'A', rx, ry, '0 0 1', ex, h + ey, 'L', ex, ey, 'A', rx, ry, '0 0 0', sx, sy, 'z']
        .join(' ');
    }
  
    /**
     * Helper to draw pieInnerSlice
     * @param d data
     * @param rx radius X
     * @param ry radius Y
     * @param rz radius Z
     * @param h height
     */
    private pieInner(d:any, rx:number, ry:number, rz:number, h:number): string {
      const startAngle = (d.startAngle < Math.PI ? Math.PI : d.startAngle);
      const endAngle = (d.endAngle < Math.PI ? Math.PI : d.endAngle);
  
      const sx = rz * rx * Math.cos(startAngle);
      const sy = rz * ry * Math.sin(startAngle);
      const ex = rz * rx * Math.cos(endAngle);
      const ey = rz * ry * Math.sin(endAngle);
  
      return ['M', sx, sy, 'A', rz * rx, rz * ry, '0 0 1', ex, ey, 'L', ex, h + ey, 'A', rz * rx, rz * ry, '0 0 0', sx, h + sy, 'z']
        .join(' ');
    }
  
    /**
     * Get Label percentage
     * @param d data
     */
    private getPercent(d:any): string {
      const precision = 0;
      return (d.endAngle - d.startAngle > 0.2 ?
        Math.round(100 * Math.pow(10, precision) * (d.endAngle - d.startAngle) / (Math.PI * 2)) / Math.pow(10, precision) + '%  ('+d.data.Count+')' : '');
    }
  
  }
  