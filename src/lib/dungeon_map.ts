import * as d3 from 'd3';
import type { TileData } from "../types/types"

const width = 300;
const height = 300;
const margin = {
  top: 30,
  right: 30,
  bottom: 30,
  left: 30
}
const color = "rgba(0, 0, 0, 0.1)";

interface ChartOptions {
  mode?: ChartMode
}

enum ChartMode {
  TILE = "tile",
  IMAGE = "image"
}

const get_transform = function (d, x, y) {
  let out = 0;
  const offset = x(10) - x(5);

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

const drawSeparate = function (el, data, mode, x, y) {
  // Group  by z
  const grouped = d3.group(data, (d: TileData) => d.z)

  grouped.forEach(data => {
    const svg = d3.select(el)
      .append("svg")
      .attr("width", width)
      .attr("height", height)

    // TODO: Simplify this
    if (mode === ChartMode.TILE) {
      svg
        .append("g")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", d => x(d.x))
        .attr("y", d => y(d.y))
        .attr("height", d => y(d.y) - y(d.y + 10))
        .attr("width", d => x(d.x) - x(d.x - 10))
        .attr("fill", color)
        .attr("transform", d => get_transform(d, x, y))
        .attr("data-rotation", d => d.rotation)
    } else if (mode === ChartMode.IMAGE) {
      svg
        .append("g")
        .selectAll("image")
        .data(data)
        .join("image")
        .attr("x", (d: TileData) => x(d.x))
        .attr("y", (d: TileData) => y(d.y))
        .attr("height", (d: TileData) => y(d.y) - y(d.y + 10))
        .attr("width", (d: TileData) => x(d.x) - x(d.x - 10))
        .attr("xlink:href", (d: TileData) => "/tiles/" + d.environment_id + ".bmp")
        .attr("fill", color)
        .attr("transform", (d: TileData) => get_transform(d, x, y))
        .attr("data-rotation", (d: TileData) => d.rotation)
        .attr("onerror", "this.remove()")
    }
  });
}

export const draw = function (el, data, options: ChartOptions = {}) {
  let mode = options.mode || ChartMode.IMAGE

  // Compute scales globally
  const x = d3.scaleLinear()
    .domain(d3.extent(data, (d: TileData) => d.x))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain(d3.extent(data, (d: TileData) => d.y))
    .range([height - margin.bottom, margin.top]);

  // Square up x and y domains
  if (x.domain()[1] < Math.abs(y.domain()[0])) {
    x.domain([d3.min(data, (d: TileData) => d.x), Math.abs(y.domain()[0])])
  } else if (x.domain()[1] > Math.abs(y.domain()[0])) {
    y.domain([-x.domain()[1], d3.max(data, (d: TileData) => d.y)])
  }

  drawSeparate(el, data, mode, x, y);
}