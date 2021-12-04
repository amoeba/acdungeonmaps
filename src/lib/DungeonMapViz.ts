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
const layerOffset = 10 * tileSize;

enum ChartMode {
  TILE = "tile",
  IMAGE = "image"
}

const tileConfig = {
  [ChartMode.IMAGE]: {
    selector: "image",
    element: "image",
    "xlink:href": (d: TileData) => "/tiles/" + d.environment_id + ".bmp",
    "onerror": "this.remove()"
  },

  [ChartMode.TILE]: {
    selector: "rect",
    element: "rect"
  }
}

export class DungeonMapViz {
  el: Element
  id: string
  name: string
  data: TileData[]
  mode: ChartMode
  infoEl: Element
  scaleX: any // TODO: Type
  scaleY: any // TODO: Type
  offset: number

  constructor(el: Element, id: string, name: string, data: TileData[], mode?: ChartMode) {
    this.el = el
    this.id = id
    this.name = name
    this.data = data
    this.mode = mode || ChartMode.IMAGE
    this.offset = 0

    this.drawControls();
  }

  draw() {
    // Compute scales globally
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

    this.drawSeparate();
  }

  drawSeparate() {
    // Group by z
    const grouped = d3.group(this.data, (d: TileData) => d.z)

    // Start drawing
    const target = d3.select(this.el)

    // TODO: Can I make this update instead of just nuking
    target.select("svg").remove();

    const svg = target
      .append("svg")
      .attr("width", width)
      .attr("height", height)

    const g = svg.append("g");

    // Label
    g.append("g")
      .append("text")
      .attr("class", "label")
      .attr("x", 0)
      .attr("y", 0)
      .text("0x" + this.id + " (" + this.name + ")")

    // Zoom + pan behavior
    const zoom = d3.zoom().on("zoom", e => {
      g.attr("transform", e.transform)
    });

    svg.call(zoom)
      .call(zoom.transform, d3.zoomIdentity)

    zoom.scaleTo(svg.transition().duration(0), 0.5);
    zoom.translateTo(svg.transition().duration(0), width - 15, height - 35);

    grouped.forEach(data => {
      this.drawLayer(g, data)
    })
  }

  drawLayer(g: d3.Selection<SVGGElement, unknown, null, undefined>, data: TileData[]) {
    // Add each layer to it's own group and offset it
    const layer = g.append("g")
      .attr("transform", "translate(" + this.offset + ", " + 0 + ")");

    // Calculate offset based on the tiles
    const extent = d3.extent(data, (d: TileData) => d.x);
    this.offset += this.scaleX(extent[1]) - this.scaleX(extent[0]) + this.scaleX(layerOffset)

    // Grab the config for this tile mode
    const config = tileConfig[this.mode]

    // Render with common properties
    const final = layer
      .selectAll(config.selector)
      .data(data)
      .join(config.element)
      .attr("x", d => this.scaleX(d.x))
      .attr("y", d => this.scaleY(d.y))
      .attr("height", d => this.scaleY(d.y) - this.scaleY(d.y + tileSize))
      .attr("width", d => this.scaleX(d.x) - this.scaleX(d.x - tileSize))
      .attr("stroke", "black")
      .attr("fill", "rgba(200, 200, 200, 0.75)")
      .attr("transform", d => this.getTransform(d, this.scaleX, this.scaleY))
      .attr("data-rotation", d => d.rotation)
      .on("mouseover", (e, d) => {
        this.infoEl.innerHTML = this.infoTemplate(e, d);
      })
      .on("mouseout", (e, d) => {
        this.infoEl.innerHTML = "";
      })

    // Add in specialized properties
    if (config["xlink:href"]) {
      final.attr("xlink:href", (d: TileData) => "/tiles/" + d.environment_id + ".bmp")
    }

    if (config["onerror"]) {
      final.attr("onerror", "this.remove()")
    }
  }

  toggle(): void {
    if (this.mode === ChartMode.TILE) {
      this.mode = ChartMode.IMAGE
    } else {
      this.mode = ChartMode.TILE
    }

    this.offset = 0
    this.draw()
  }

  getTransform(d, x, y): string {
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

  drawControls(): void {
    // Main control bar
    const controls = document.createElement("div");
    controls.className = "controls";

    // Toggle button
    const toggleButton = document.createElement("button");
    toggleButton.textContent = "Toggle Tiles"
    toggleButton.onclick = (e) => { this.toggle(); }
    controls.appendChild(toggleButton);

    // Info bar
    const infoBar = document.createElement("div");
    infoBar.className = "info";
    controls.appendChild(infoBar);
    this.infoEl = infoBar;

    this.el.appendChild(controls);
  }

  infoTemplate(event, data): string {
    return "x: " + data.x + ", y: " + data.y + ", z: " + data.z;
  }
}
