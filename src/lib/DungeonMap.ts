import * as d3 from 'd3';
import type { TileData } from "../types/types"

const width = 1000;
const height = 1000;
const margin = {
  top: 50,
  right: 50,
  bottom: 50,
  left: 50
}
const color = "rgba(0, 0, 0, 0.1)";
const tileSize = 10;

interface ChartOptions {
  mode?: ChartMode
}

enum ChartMode {
  TILE = "tile",
  IMAGE = "image"
}


export class DungeonMap {
  el: Element
  data: TileData[]
  mode: ChartMode

  constructor(el: Element, data: TileData[], mode?: ChartMode) {
    this.el = el
    this.data = data
    this.mode = mode || ChartMode.TILE
  }

  draw(options?: ChartOptions) {
    // Compute scales globally
    const x = d3.scaleLinear()
      .domain(d3.extent(this.data, (d: TileData) => d.x))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain(d3.extent(this.data, (d: TileData) => d.y))
      .range([height - margin.bottom, margin.top]);

    // Square up x and y domains
    if (x.domain()[1] < Math.abs(y.domain()[0])) {
      x.domain([d3.min(this.data, (d: TileData) => d.x), Math.abs(y.domain()[0])])
    } else if (x.domain()[1] > Math.abs(y.domain()[0])) {
      y.domain([-x.domain()[1], d3.max(this.data, (d: TileData) => d.y)])
    }

    this.drawSeparate(x, y);
  }

  drawSeparate(x, y) {
    // Group  by z
    const grouped = d3.group(this.data, (d: TileData) => d.z)

    const svg = d3.select(this.el)
      .append("svg")
      .attr("width", width)
      .attr("height", height)

    let offset = 0;

    grouped.forEach(data => {
      const g = svg.append("g")
        .attr("transform", "translate(" + offset + ", " + offset + ")");
      offset += 100;

      // TODO: Simplify this
      if (this.mode === ChartMode.TILE) {
        g
          .append("g")
          .selectAll("rect")
          .data(data)
          .join("rect")
          .attr("x", d => x(d.x))
          .attr("y", d => y(d.y))
          .attr("height", d => y(d.y) - y(d.y + tileSize))
          .attr("width", d => x(d.x) - x(d.x - tileSize))
          .attr("fill", color)
          .attr("transform", d => this.getTransform(d, x, y))
          .attr("data-rotation", d => d.rotation)
      } else if (this.mode === ChartMode.IMAGE) {
        g
          .append("g")
          .selectAll("image")
          .data(data)
          .join("image")
          .attr("x", (d: TileData) => x(d.x))
          .attr("y", (d: TileData) => y(d.y))
          .attr("height", (d: TileData) => y(d.y) - y(d.y + tileSize))
          .attr("width", (d: TileData) => x(d.x) - x(d.x - tileSize))
          .attr("xlink:href", (d: TileData) => "/tiles/" + d.environment_id + ".bmp")
          .attr("fill", color)
          .attr("transform", (d: TileData) => this.getTransform(d, x, y))
          .attr("data-rotation", (d: TileData) => d.rotation)
          .attr("onerror", "this.remove()")
      }
    });
  }

  getTransform(d, x, y) {
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
}
