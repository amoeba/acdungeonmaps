import * as d3 from 'd3';

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

const get_rot = function (d, x, y) {
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

  const rot_string = "rotate(" + out + " " + (x(d.x) + offset) + " " + (y(d.y) + offset) + ")";
  // const rot_string = "rotate(" + out + ")";

  return rot_string;
}

export const draw = function (el, data, options: ChartOptions = {}) {
  let mode = options.mode || ChartMode.IMAGE

  // Group  by z
  const grouped = d3.group(data, d => d.z)

  // Compute scales globally
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.x))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.y))
    .range([height - margin.bottom, margin.top]);

  // Square up x and y domains
  if (x.domain()[1] < Math.abs(y.domain()[0])) {
    x.domain([d3.min(data, d => d.x), Math.abs(y.domain()[0])])
  } else if (x.domain()[1] > Math.abs(y.domain()[0])) {
    y.domain([-x.domain()[1], d3.max(data, d => d.y)])
  }

  grouped.forEach(data => {
    const svg = d3.select(el)
      .append("svg")
      .attr("width", width)
      .attr("height", height)

    const label = svg.append("g")
      .attr("transform", "translate(0, 16)")

    label
      .append("text")
      .text("Z: " + data[0].z)

    // TODO: Simplify
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
        .attr("transform", d => get_rot(d, x, y))
        .attr("data-rotation", d => d.rotation)
    } else if (mode === ChartMode.IMAGE) {
      svg
        .append("g")
        .selectAll("image")
        .data(data)
        .join("image")
        .attr("x", d => x(d.x))
        .attr("y", d => y(d.y))
        .attr("height", d => y(d.y) - y(d.y + 10))
        .attr("width", d => x(d.x) - x(d.x - 10))
        .attr("xlink:href", d => "/tiles/" + d.environment_id + ".bmp")
        .attr("fill", color)
        .attr("transform", d => get_rot(d, x, y))
        .attr("data-rotation", d => d.rotation)
        .attr("onerror", "this.remove()")
    }
  });
}