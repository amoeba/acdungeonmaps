import * as d3 from "d3";
import type { TileData } from "../types/types";

// TODO: Move to a more appropriate place
const width = 600;
const height = 600;
const margin = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const tileSize = 10;

export class LayeredMapViz {
  el: Element;
  id: string;
  name: string;
  data: TileData[];
  infoEl: Element;
  scaleX: any; // TODO: Type
  scaleY: any; // TODO: Type
  offset: number;
  mapTitle: Element;
  currentZ: number;
  extentZ: number[];

  constructor(el: Element, id: string, name: string, data: TileData[]) {
    this.el = el;
    this.id = id;
    this.name = name;
    this.data = data;
    this.currentZ = 0;
    this.extentZ = [0, 0];
  }

  getRotateTransform(d, x, y): string {
    let out = 0;
    const offset = x(tileSize) - x(tileSize / 2);

    const w = Number(d.rotation);

    if (w == 1) {
      out = 0;
    } else if (w < -0.7 && w > -0.8) {
      out = -90;
    } else if (w > 0.7 && w < 0.8) {
      out = 90;
    } else {
      out = 180;
    }

    return (
      "rotate(" + out + " " + (x(d.x) + offset) + " " + (y(d.y) + offset) + ")"
    );
  }

  computeScales() {
    this.scaleX = d3
      .scaleLinear()
      .domain(d3.extent(this.data, (d: TileData) => d.x))
      .range([margin.left, width - margin.right]);

    this.scaleY = d3
      .scaleLinear()
      .domain(d3.extent(this.data, (d: TileData) => d.y))
      .range([height - margin.bottom, margin.top]);

    // Square up x and y domains
    if (this.scaleX.domain()[1] < Math.abs(this.scaleY.domain()[0])) {
      this.scaleX.domain([
        d3.min(this.data, (d: TileData) => d.x),
        Math.abs(this.scaleY.domain()[0]),
      ]);
    } else if (this.scaleX.domain()[1] > Math.abs(this.scaleY.domain()[0])) {
      this.scaleY.domain([
        -this.scaleX.domain()[1],
        d3.max(this.data, (d: TileData) => d.y),
      ]);
    }

    // Compute min and max Z so we can clamp
    this.extentZ = d3.extent(this.data, (d: TileData) => d.z);
  }

  updateLayerOpacity() {
    const layers = document.querySelectorAll(".layer");

    layers.forEach((l) => {
      if (Math.abs(l.dataset.z - this.currentZ) < 9) {
        l.setAttribute("opacity", "1");
      } else {
        l.setAttribute("opacity", "0.2");
      }
    });
  }

  updateLabel() {
    this.mapTitle.innerHTML = `Z: ${this.currentZ}`;
  }

  setZClamped(proposal: number) {
    let proposedZ = proposal;

    if (proposedZ < this.extentZ[0]) {
      proposedZ = this.extentZ[0];
    } else if (proposedZ > this.extentZ[1]) {
      proposedZ = this.extentZ[1];
    }

    this.currentZ = proposedZ;
  }

  draw() {
    // Wrapper elements for convenience
    const containerNode = document.createElement("div");
    containerNode.classList.add("map-container");
    this.mapTitle = document.createElement("div");
    this.mapTitle.classList.add("map-title");
    containerNode.appendChild(this.mapTitle);
    this.el.appendChild(containerNode);

    const grouped = d3.group(this.data, (d: TileData) => d.z);
    this.computeScales();

    const svg = d3
      .create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    containerNode.appendChild(svg.node());

    const layers = svg.append("g");

    layers
      .selectAll(".layers")
      .data(grouped)
      .join("g")
      .attr("class", "layer")
      .attr("data-z", (d) => d[0])
      .selectAll(".tile")
      .data((d) => d[1])
      .join("image")
      .attr("x", (d) => this.scaleX(d.x))
      .attr("y", (d) => this.scaleY(d.y))
      .attr("width", (d) => this.scaleX(tileSize))
      .attr("height", (d) => this.scaleY(tileSize))
      .attr("transform", (d) =>
        this.getRotateTransform(d, this.scaleX, this.scaleY)
      )
      .attr("data-rotation", (d) => d.rotation)
      .attr(
        "xlink:href",
        (d: TileData) => "/tiles/" + d.environment_id + ".bmp"
      )
      .attr("onerror", "this.remove()");

    // Zoom + pan behavior
    const zoom = d3.zoom().on("zoom", (e) => {
      // Actual zooming is commented out since it doesn't work for this viz
      // layers.attr("transform", e.transform)

      // Handle level zooming safely
      if (e && e.sourceEvent) {
        // Method one: Commentd out for now until I find something I like
        // let proposedZ = Math.floor(e.sourceEvent.deltaY / 10);

        // if (isNaN(proposedZ)) {
        //   proposedZ = 0;
        // }

        // this.currentZ += proposedZ;

        // Method two
        let proposedZ = 0;

        if (e.sourceEvent.deltaY > 0) {
          proposedZ = this.currentZ + 10;
        } else {
          proposedZ = this.currentZ - 10;
        }

        if (proposedZ < this.extentZ[0]) {
          proposedZ = this.extentZ[0];
        } else if (proposedZ > this.extentZ[1]) {
          proposedZ = this.extentZ[1];
        }

        this.currentZ = proposedZ;

        this.updateLayerOpacity();
      }

      this.updateLabel();
    });

    svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

    this.updateLayerOpacity();
    this.updateLabel();

    // Controls
    const onKeyDown = (e) => {
      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
          this.setZClamped(this.currentZ + 10);
          this.updateLabel();
          this.updateLayerOpacity();
          break;
        case "ArrowDown":
        case "KeyS":
          this.setZClamped(this.currentZ - 10);
          this.updateLabel();
          this.updateLayerOpacity();
          break;
      }
    };

    document.addEventListener("keydown", onKeyDown);
  }
}
