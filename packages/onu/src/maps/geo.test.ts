import { describe, expect, it } from "vitest"

import { createTranslator } from "../i18n/translate"
import { dv, en } from "../locales"
import {
  bearingDegrees,
  boundsCenter,
  boundsContains,
  boundsEqual,
  boundsForView,
  boundsOf,
  compassDirection,
  compassLabel,
  distanceMeters,
  formatArea,
  formatCoordinate,
  formatDistance,
  formatDuration,
  formatLatLng,
  fromPosition,
  googleDirectionsUrl,
  googleMapsUrl,
  interpolateLatLng,
  isValidLatLng,
  latLngEquals,
  lineStringToPath,
  normalizeTrack,
  pathLength,
  pathToLineString,
  polygonArea,
  polygonsToShapes,
  project,
  roundLatLng,
  shapesToPolygons,
  staticMapUrl,
  straightRoute,
  toPosition,
  trackStateAt,
  travelledPath,
  unproject,
  zoomForBounds,
  type TrackFeature,
} from "./geo"

const t = createTranslator(en)
const tdv = createTranslator(dv, en)
const strip = (s: string) => s.replace(/[⁦⁩]/g, "")

const male = { lat: 4.1755, lng: 73.5093 }
const hulhumale = { lat: 4.2105, lng: 73.5402 }

describe("points", () => {
  it("validates, compares and rounds", () => {
    expect(isValidLatLng(male)).toBe(true)
    expect(isValidLatLng({ lat: 91, lng: 0 })).toBe(false)
    expect(isValidLatLng({ lat: Number.NaN, lng: 0 })).toBe(false)
    expect(isValidLatLng(null)).toBe(false)
    expect(latLngEquals(male, { ...male })).toBe(true)
    expect(latLngEquals(male, null)).toBe(false)
    expect(latLngEquals(null, null)).toBe(true)
    expect(roundLatLng({ lat: 4.123456789, lng: 73.987654321 })).toEqual({ lat: 4.123457, lng: 73.987654 })
    expect(toPosition(male)).toEqual([73.5093, 4.1755])
    expect(fromPosition([73.5093, 4.1755])).toEqual(male)
    expect(interpolateLatLng({ lat: 0, lng: 0 }, { lat: 2, lng: 4 }, 0.5)).toEqual({ lat: 1, lng: 2 })
  })
})

describe("measurements", () => {
  it("measures distance, length and area with turf", () => {
    const d = distanceMeters(male, hulhumale)
    expect(d).toBeGreaterThan(5000)
    expect(d).toBeLessThan(5500)
    expect(pathLength([male])).toBe(0)
    expect(pathLength([male, hulhumale, male])).toBeCloseTo(d * 2, 0)
    expect(polygonArea([male, hulhumale])).toBe(0)
    const square = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 0.01 },
      { lat: 0.01, lng: 0.01 },
      { lat: 0.01, lng: 0 },
    ]
    expect(polygonArea(square)).toBeGreaterThan(1_200_000)
    expect(polygonArea([...square, square[0]!])).toBeCloseTo(polygonArea(square), 0)
  })

  it("gives bearings and compass directions", () => {
    expect(bearingDegrees({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeCloseTo(0)
    expect(bearingDegrees({ lat: 0, lng: 0 }, { lat: 0, lng: -1 })).toBeCloseTo(270)
    expect(compassDirection(0)).toBe("north")
    expect(compassDirection(44)).toBe("northEast")
    expect(compassDirection(359)).toBe("north")
    expect(compassDirection(-90)).toBe("west")
    expect(compassLabel("southWest", t)).toBe("south-west")
    expect(compassLabel("east", tdv)).toBe("އިރުމަތި")
  })
})

describe("formatting", () => {
  it("formats coordinates in both locales", () => {
    expect(strip(formatCoordinate(4.1755, "lat", t))).toBe("4.175500° N")
    expect(strip(formatCoordinate(-0.6, "lat", t, "en", 2))).toBe("0.60° S")
    expect(strip(formatCoordinate(-73, "lng", t, "en", 1))).toBe("73.0° W")
    expect(strip(formatLatLng(male, t, "en", 2))).toBe("4.18° N, 73.51° E")
    expect(strip(formatLatLng(male, tdv, "en", 2))).toBe("4.18° އުތުރު, 73.51° އިރުމަތި")
  })

  it("formats distance, area and duration", () => {
    expect(formatDistance(850.4, t)).toBe("850 m")
    expect(formatDistance(1234, t)).toBe("1.23 km")
    expect(formatDistance(25_400, t)).toBe("25.4 km")
    expect(formatDistance(500, tdv)).toBe("500 މީޓަރު")
    expect(formatArea(640, t)).toBe("640 m²")
    expect(formatArea(24_000, t)).toBe("2.4 ha")
    expect(formatArea(3_100_000, t)).toBe("3.1 km²")
    expect(formatDuration(30, t)).toBe("1 min")
    expect(formatDuration(45 * 60, t)).toBe("45 min")
    expect(formatDuration(2 * 3600, t)).toBe("2 h")
    expect(formatDuration(2 * 3600 + 5 * 60, t)).toBe("2 h 5 min")
  })
})

describe("bounds and projection", () => {
  it("computes bounds", () => {
    expect(boundsOf([])).toBeNull()
    const b = boundsOf([male, hulhumale])!
    expect(b).toEqual({ north: 4.2105, south: 4.1755, east: 73.5402, west: 73.5093 })
    expect(boundsCenter(b)).toEqual({ lat: 4.193, lng: 73.52475 })
    expect(boundsContains(b, { lat: 4.19, lng: 73.52 })).toBe(true)
    expect(boundsContains(b, { lat: 4.3, lng: 73.52 })).toBe(false)
    expect(boundsContains({ north: 1, south: -1, west: 170, east: -170 }, { lat: 0, lng: 175 })).toBe(true)
    expect(boundsEqual(b, { ...b })).toBe(true)
    expect(boundsEqual(b, null)).toBe(false)
  })

  it("round-trips Web Mercator projection", () => {
    const p = project(male, 12)
    const back = unproject(p, 12)
    expect(back.lat).toBeCloseTo(male.lat, 6)
    expect(back.lng).toBeCloseTo(male.lng, 6)
    expect(project({ lat: 89.9, lng: 0 }, 0).y).toBeCloseTo(0, 5)
    const view = boundsForView(male, 12, 640, 360)
    expect(boundsContains(view, male)).toBe(true)
    const z = zoomForBounds(boundsOf([male, hulhumale])!, 640, 360)
    expect(z).toBeGreaterThan(10)
    expect(z).toBeLessThan(16)
    expect(zoomForBounds({ north: 80, south: -80, east: 179, west: -179 }, 10, 10)).toBe(1)
  })
})

describe("GeoJSON", () => {
  it("converts shapes and polygons both ways, keeping properties", () => {
    const shapes = [
      { id: "a", path: [male, hulhumale, { lat: 4.2, lng: 73.5 }] },
      { id: "draft", path: [male] },
    ]
    const fc = shapesToPolygons(shapes, {
      type: "FeatureCollection",
      features: [
        { type: "Feature", id: "a", properties: { name: "Zone" }, geometry: { type: "Polygon", coordinates: [] } },
      ],
    })
    expect(fc.features).toHaveLength(1)
    expect(fc.features[0]!.properties).toEqual({ name: "Zone" })
    const ring = fc.features[0]!.geometry.coordinates[0]!
    expect(ring[0]).toEqual(ring[ring.length - 1])
    expect(polygonsToShapes(fc)).toEqual([{ id: "a", path: shapes[0]!.path }])
    expect(polygonsToShapes(null)).toEqual([])
    expect(
      polygonsToShapes({
        type: "FeatureCollection",
        features: [{ type: "Feature", properties: null, geometry: { type: "Polygon", coordinates: [[[1, 2]]] } }],
      }),
    ).toEqual([{ id: "polygon-1", path: [{ lat: 2, lng: 1 }] }])
  })

  it("converts line strings", () => {
    expect(pathToLineString([male])).toBeNull()
    const f = pathToLineString([male, hulhumale])!
    expect(f.geometry.coordinates).toEqual([toPosition(male), toPosition(hulhumale)])
    expect(lineStringToPath(f)).toEqual([male, hulhumale])
    expect(lineStringToPath(f.geometry)).toEqual([male, hulhumale])
    expect(lineStringToPath(null)).toEqual([])
  })
})

describe("routes and tracks", () => {
  it("builds a straight route with translated steps", () => {
    const r = straightRoute([male, hulhumale, male], ({ from, to, direction }) => `${from}->${to} ${direction}`)
    expect(r.source).toBe("straight")
    expect(r.legs).toHaveLength(2)
    expect(r.legs[0]!.steps[0]!.instruction).toBe("0->1 northEast")
    expect(r.legs[1]!.distance).toBeCloseTo(distanceMeters(hulhumale, male))
  })

  it("normalises tracks and interpolates positions", () => {
    const track = [
      { lat: 0, lng: 0, time: 0 },
      { lat: 0, lng: 1, time: 1000 },
      { lat: 1, lng: 1, time: 2000 },
    ]
    expect(normalizeTrack([track[2]!, track[0]!, track[1]!])).toEqual(track)
    expect(normalizeTrack(null)).toEqual([])
    const feature: TrackFeature = {
      type: "Feature",
      properties: { timestamps: ["1970-01-01T00:00:01Z", 0, "bad"] },
      geometry: {
        type: "LineString",
        coordinates: [
          [1, 1],
          [0, 0],
          [5, 5],
        ],
      },
    }
    expect(normalizeTrack(feature)).toEqual([
      { lat: 0, lng: 0, time: 0 },
      { lat: 1, lng: 1, time: 1000 },
    ])

    expect(trackStateAt([], 0).index).toBe(-1)
    expect(trackStateAt(track, -5)).toMatchObject({ position: track[0], index: 0 })
    expect(trackStateAt([track[0]!], 5)).toMatchObject({ heading: 0, index: 0 })
    expect(trackStateAt(track, 9999)).toMatchObject({ position: track[2], index: 2 })
    const mid = trackStateAt(track, 500)
    expect(mid.position).toEqual({ lat: 0, lng: 0.5 })
    expect(mid.heading).toBeCloseTo(90)
    expect(mid.index).toBe(0)
    expect(trackStateAt([track[0]!, { ...track[0]!, lng: 1 }], 0).index).toBe(0)
    expect(travelledPath(track, 1500)).toEqual([
      { lat: 0, lng: 0 },
      { lat: 0, lng: 1 },
      { lat: 0.5, lng: 1 },
    ])
    expect(travelledPath([], 0)).toEqual([])
  })
})

describe("links", () => {
  it("builds Google Maps URLs", () => {
    expect(googleMapsUrl(male)).toBe("https://www.google.com/maps/search/?api=1&query=4.1755%2C73.5093")
    expect(googleMapsUrl("Malé", "abc")).toContain("query_place_id=abc")
    const dir = googleDirectionsUrl([male, hulhumale, male], "walking")
    expect(dir).toContain("origin=4.1755%2C73.5093")
    expect(dir).toContain("waypoints=4.2105%2C73.5402")
    expect(dir).toContain("travelmode=walking")
    expect(googleDirectionsUrl([male])).not.toContain("destination")
    const s = staticMapUrl({
      apiKey: "k",
      center: male,
      width: 640,
      height: 320,
      markerColor: "#1f7a4d",
      mapId: "m",
      language: "en",
    })
    expect(s).toContain("markers=color%3A0x1f7a4d%7C4.1755%2C73.5093")
    expect(s).toContain("map_id=m")
    expect(staticMapUrl({ apiKey: "k", center: male, width: 1, height: 1 })).toContain("markers=4.1755")
    expect(staticMapUrl({ apiKey: "k", center: male, width: 1, height: 1, mapId: "DEMO_MAP_ID" })).not.toContain(
      "map_id",
    )
  })
})
