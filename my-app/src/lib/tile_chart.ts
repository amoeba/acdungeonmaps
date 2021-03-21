import * as d3 from 'd3';

const width = 300;
const height = 300;
const margin = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
}

const color = "rgba(0, 0, 0, 0.1)";

export const drawLevels = function (el, data) {

}
export const draw = function (el, data) {
  // Group  by z
  const grouped = d3.group(data, d => d.z)
  console.log(grouped)

  // Compute scales globally
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.x))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.y))
    .range([height - margin.bottom, margin.top]);

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
  });
}
