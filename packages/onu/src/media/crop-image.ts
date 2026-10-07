/** A crop rectangle in source-image pixels (what `react-easy-crop` reports as `croppedAreaPixels`). */
export interface PixelCrop {
  x: number
  y: number
  width: number
  height: number
}

export interface CropImageOptions {
  /** Rotation in degrees, applied before cropping. */
  rotation?: number
  /** Output type. Default `image/jpeg` (`image/png` keeps transparency). */
  type?: string
  /** 0–1 quality for lossy types. Default `0.92`. */
  quality?: number
  /** Scale the result down so neither side exceeds this many pixels. */
  maxSize?: number
}

/** Loads an image (for cropping). Rejects if it fails to load. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Could not load image: ${src}`))
    image.src = src
  })
}

/** Size of the bounding box of a `width × height` rectangle rotated by `rotation` degrees. */
export function rotatedSize(width: number, height: number, rotation: number) {
  const rad = (rotation * Math.PI) / 180
  return {
    width: Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
    height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not export the cropped image"))),
      type,
      quality,
    ),
  )
}

/**
 * Crops (and optionally rotates and scales down) an image with a canvas and returns a Blob.
 * `crop` is in the rotated image's pixel space, as `react-easy-crop` reports it.
 */
export async function cropImage(
  src: string,
  crop: PixelCrop,
  { rotation = 0, type = "image/jpeg", quality = 0.92, maxSize }: CropImageOptions = {},
): Promise<Blob> {
  const image = await loadImage(src)
  const bounds = rotatedSize(image.naturalWidth, image.naturalHeight, rotation)

  // Draw the whole rotated image, then copy the crop out of it.
  const rotated = document.createElement("canvas")
  rotated.width = Math.round(bounds.width)
  rotated.height = Math.round(bounds.height)
  const rctx = rotated.getContext("2d")
  if (!rctx) throw new Error("Canvas is not supported")
  rctx.translate(rotated.width / 2, rotated.height / 2)
  rctx.rotate((rotation * Math.PI) / 180)
  rctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2)

  const scale = maxSize ? Math.min(1, maxSize / Math.max(crop.width, crop.height)) : 1
  const out = document.createElement("canvas")
  out.width = Math.max(1, Math.round(crop.width * scale))
  out.height = Math.max(1, Math.round(crop.height * scale))
  const ctx = out.getContext("2d")
  if (!ctx) throw new Error("Canvas is not supported")
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(rotated, crop.x, crop.y, crop.width, crop.height, 0, 0, out.width, out.height)
  return canvasToBlob(out, type, quality)
}

/** Like `cropImage`, but returns a `File` with the given name. */
export async function cropImageToFile(src: string, crop: PixelCrop, name: string, options: CropImageOptions = {}) {
  const blob = await cropImage(src, crop, options)
  return new File([blob], name, { type: blob.type || options.type || "image/jpeg", lastModified: Date.now() })
}
