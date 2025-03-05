
// Import necessary libraries and components
import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import { cn } from "@/lib/utils"
import PixelButton from "./PixelButton"

// Type definitions for the carousel component
type CarouselApi = {
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
}

// Context to share the carousel API between components
const CarouselContext = React.createContext<CarouselApi | null>(null)

// Hook to access the carousel API from child components
function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }
  return context
}

// The main Carousel component
const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    opts?: any
    orientation?: "horizontal" | "vertical"
    setApi?: (api: CarouselApi) => void
  }
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Create refs for carousel elements
    const [emblaRef, emblaApi] = useEmblaCarousel({
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    })
    
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)

    // Set up the carousel API
    const onSelect = React.useCallback(() => {
      if (!emblaApi) return

      setCanScrollPrev(emblaApi.canScrollPrev())
      setCanScrollNext(emblaApi.canScrollNext())
    }, [emblaApi])

    // Initialize the carousel
    React.useEffect(() => {
      if (!emblaApi) return

      onSelect()
      emblaApi.on("select", onSelect)
      emblaApi.on("reInit", onSelect)

      // Provide the API to parent components if needed
      if (setApi) {
        setApi({
          scrollPrev: () => emblaApi.scrollPrev(),
          scrollNext: () => emblaApi.scrollNext(),
          canScrollPrev,
          canScrollNext,
        })
      }
    }, [emblaApi, onSelect, setApi, canScrollPrev, canScrollNext])

    return (
      <CarouselContext.Provider
        value={{
          canScrollPrev,
          canScrollNext,
          scrollPrev: () => emblaApi?.scrollPrev(),
          scrollNext: () => emblaApi?.scrollNext(),
        }}
      >
        <div
          ref={ref}
          className={cn("relative", className)}
          {...props}
        >
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex" style={{
              flexDirection: orientation === "horizontal" ? "row" : "column",
            }}>
              {children}
            </div>
          </div>
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

// Carousel item component
const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    aria-roledescription="slide"
    className={cn(
      "min-w-0 shrink-0 grow-0 basis-full",
      className
    )}
    {...props}
  />
))
CarouselItem.displayName = "CarouselItem"

// Carousel content component
const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex -ml-4", className)}
    {...props}
  />
))
CarouselContent.displayName = "CarouselContent"

// Carousel navigation button
const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof PixelButton>
>(({ className, ...props }, ref) => {
  const { canScrollPrev, scrollPrev } = useCarousel()

  return (
    <PixelButton
      variant="primary"
      size="sm"
      className={cn(
        "absolute left-4 top-1/2 -translate-y-1/2 rounded-full",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      title="Previous slide"
      ref={ref}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </PixelButton>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

// Carousel next button
const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof PixelButton>
>(({ className, ...props }, ref) => {
  const { canScrollNext, scrollNext } = useCarousel()

  return (
    <PixelButton
      variant="primary"
      size="sm"
      className={cn(
        "absolute right-4 top-1/2 -translate-y-1/2 rounded-full",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      title="Next slide"
      ref={ref}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </PixelButton>
  )
})
CarouselNext.displayName = "CarouselNext"

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
