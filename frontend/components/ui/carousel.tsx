"use client"

import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { cn } from "@/lib/utils"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>

type CarouselProps = {
  opts?: UseCarouselParameters[0]
  plugins?: UseCarouselParameters[1]
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
} & React.HTMLAttributes<HTMLDivElement>

export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins
    )

    React.useEffect(() => {
      if (!api || !setApi) return
      setApi(api)
    }, [api, setApi])

    return (
      <div
        ref={ref}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        <div ref={carouselRef} className="overflow-hidden">
          <div
            className={cn(
              "flex",
              orientation === "horizontal" ? "flex-row" : "flex-col"
            )}
          >
            {children}
          </div>
        </div>
      </div>
    )
  }
)

Carousel.displayName = "Carousel"

/* CONTENT WRAPPER */
export const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex", className)} {...props} />
))
CarouselContent.displayName = "CarouselContent"

/* SLIDE ITEM */
export const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    aria-roledescription="slide"
    className={cn("shrink-0 grow-0 basis-full", className)}
    {...props}
  />
))
CarouselItem.displayName = "CarouselItem"

/* BUTTON PROPS TYPE */
export interface CarouselButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> { }

/* PREVIOUS BUTTON */
export const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  CarouselButtonProps
>(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "absolute left-2 top-1/2 -translate-y-1/2",
        className
      )}
      {...props}
    >
      Prev
    </button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

/* NEXT BUTTON */
export const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  CarouselButtonProps
>(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "absolute right-2 top-1/2 -translate-y-1/2",
        className
      )}
      {...props}
    >
      Next
    </button>
  )
})
CarouselNext.displayName = "CarouselNext"
