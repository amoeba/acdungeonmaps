import * as d3 from 'd3';
import type { TileData } from "../types/types"

const width = 300;
const height = 300;
const margin = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
}

const tileSize = 10;

export class LayeredMapViz {
  el: Element
  id: string
  name: string
  data: TileData[]
  infoEl: Element
  scaleX: any // TODO: Type
  scaleY: any // TODO: Type
  offset: number

  constructor(el: Element, id: string, name: string, data: TileData[]) {
    this.el = el
    this.id = id
    this.name = name
    this.data = data
  }

  getRotateTransform(d, x, y): string {
    let out = 0;
    const offset = x(tileSize) - x(tileSize / 2);

    const w = Number(d.rotation);

    if (w == 1) {
      out = 0;
    }
    else if (w < -0.70 && w > -0.8) {
      out = -90;
    }
    else if (w > 0.70 && w < 0.8) {
      out = 90;
    } else {
      out = 180;
    }

    return "rotate(" + out + " " + (x(d.x) + offset) + " " + (y(d.y) + offset) + ")";
  }

  computeScales() {
    this.scaleX = d3.scaleLinear()
      .domain(d3.extent(this.data, (d: TileData) => d.x))
      .range([margin.left, width - margin.right]);

    this.scaleY = d3.scaleLinear()
      .domain(d3.extent(this.data, (d: TileData) => d.y))
      .range([height - margin.bottom, margin.top]);

    // Square up x and y domains
    if (this.scaleX.domain()[1] < Math.abs(this.scaleY.domain()[0])) {
      this.scaleX.domain([d3.min(this.data, (d: TileData) => d.x), Math.abs(this.scaleY.domain()[0])])
    } else if (this.scaleX.domain()[1] > Math.abs(this.scaleY.domain()[0])) {
      this.scaleY.domain([-this.scaleX.domain()[1], d3.max(this.data, (d: TileData) => d.y)])
    }
  }

  draw() {
    const grouped = d3.group(this.data, (d: TileData) => d.z)
    this.computeScales();

    const width = 300;
    const height = 300;
    const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const layers = svg.append("g")

    layers
      .selectAll("g")
      .data(grouped)
      .enter()
        .append("g")
        .selectAll(".tile")
        .data(d => d[1])
        .join("image")
        .attr("x", d => this.scaleX(d.x))
        .attr("y", d => this.scaleY(d.y))
        .attr("width", d => this.scaleX(tileSize))
        .attr("height", d => this.scaleY(tileSize))
        .attr("transform", d => this.getRotateTransform(d, this.scaleX, this.scaleY))
        .attr("data-rotation", d => d.rotation)
        .attr("xlink:href", (d: TileData) => "/tiles/" + d.environment_id + ".bmp")
        .attr("onerror", "this.remove()")

    // Zoom + pan behavior
    const zoom = d3.zoom().on("zoom", e => {
      console.log(e)
      layers.attr("transform", e.transform)
    });

    svg.call(zoom)
      .call(zoom.transform, d3.zoomIdentity);

    //
    const containerNode = document.createElement("div");
    containerNode.classList.add("map-container");

    const mapTitle = document.createElement("div");
    mapTitle.classList.add("map-title");
    mapTitle.innerHTML = `TODO`;

    containerNode.appendChild(mapTitle);
    containerNode.appendChild(svg.node());

    this.el.appendChild(containerNode)
  }
}
