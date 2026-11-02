var e=`import {
  Carousel,
  CarouselAutoplayToggle,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { islandPhotos } from "./_mock"

export const meta = { title: "Carousel", group: "Files and media", order: 13 }

export default function CarouselDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="Autoplay with pause, dots and swipe"
        description="Pauses on hover and focus. Arrow keys follow the reading direction (try RTL)."
        className="block w-full"
      >
        <Carousel label="Featured islands" autoplay={{ delay: 4000 }} loop className="max-w-2xl mx-auto">
          <CarouselContent>
            {islandPhotos.map((photo) => (
              <CarouselItem key={photo.alt}>
                <figure className="relative overflow-hidden rounded-xl">
                  <img src={photo.src} alt={photo.alt} loading="lazy" className="aspect-video w-full object-cover" />
                  <figcaption className="start-0 bottom-0 m-3 px-2 py-1 text-sm absolute rounded-md bg-background/85">
                    {photo.title}
                  </figcaption>
                </figure>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-3 gap-2 flex items-center justify-center">
            <CarouselAutoplayToggle />
            <CarouselDots className="mt-0" />
          </div>
        </Carousel>
      </DemoSection>
      <DemoSection title="Several per view with arrows" className="block w-full">
        <Carousel label="Atolls" opts={{ align: "start" }} className="max-w-3xl px-12 mx-auto">
          <CarouselContent>
            {islandPhotos.map((photo) => (
              <CarouselItem key={photo.alt} className="sm:basis-1/2 lg:basis-1/3">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="aspect-square w-full rounded-lg object-cover"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="start-0" />
          <CarouselNext className="end-0" />
        </Carousel>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};