import { Job } from "./Job";
import { Task } from "../models/Task";
import { area } from "@turf/area";
import { Feature, Polygon } from "geojson";

export class PolygonAreaJob implements Job {
  async run(task: Task): Promise<number | string> {
    console.log(`Running polygon area calculation`);
    try {
      const inputGeometry: Feature<Polygon> = JSON.parse(task.geoJson);
      const calculatedArea = area(inputGeometry);
      console.log(`Calculated area ${calculatedArea} square meters`);
      return calculatedArea;
    } catch (err) {
      console.error(
        "There was an error calculating the area with the input data"
      );
      console.error("Error", err);
      return "Error calculating area of polygon";
    }
  }
}
