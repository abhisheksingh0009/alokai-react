import { useState, useEffect, useRef } from "react";
import {
  SfScrollable,
  SfButton,
  SfIconChevronLeft,
  SfIconChevronRight,
} from "@storefront-ui/react";
import classNames from "classnames";
import imgDisplay from "../../assets/carousel-display.png";
import imgDisplay2 from "../../assets/carousel-display-2.png";
import imgDisplay3 from "../../assets/carousel-display-3.png";
import imgHeroBg from "../../assets/carousel-hero-bg.png";
import imgHeroBg2 from "../../assets/carousel-hero-bg-2.png";
import imgDisplayOverlay from "../../assets/carousel-display-overlay.png";
import imgHeroHeadphones from "../../assets/carousel-hero-headphones.png";
import imgDisplay8 from "../../assets/carousel-display-8.png";

const images = [
  {
    imageSrc: imgDisplay,
    alt: "backpack1",
    title: "Pack it Up",
    subtitle: "Be active",
    description: "Explore the great outdoors with our backpacks",
    buttonText: "Discover now",
    reverse: true,
    backgroundColor: "bg-warning-200",
  },
  {
    imageSrc: imgDisplay2,
    alt: "backpack2",
    title: "Sunny Days Ahead",
    subtitle: "Be inspired",
    description: "Step out in style with our sunglasses collection",
    buttonText: "Discover now",
    reverse: true,
    backgroundColor: "bg-negative-200",
  },
  {
    imageSrc: imgDisplay3,
    alt: "backpack3",
    title: "Fresh and Bold",
    subtitle: "New collection",
    description: "Add a pop up color to your outfit",
    buttonText: "Discover now",
    reverse: false,
    backgroundColor: "bg-secondary-200",
  },
  { imageSrc: imgHeroBg, alt: "backpack4" },
  { imageSrc: imgHeroBg2, alt: "backpack5" },
  { imageSrc: imgDisplayOverlay, alt: "backpack6" },
  { imageSrc: imgHeroHeadphones, alt: "headphones" },
];
export default function Carousel() {
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const [displayIndex, setDisplayIndex] = useState(0);

  const scrollToIndex = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({ left: index * container.clientWidth, behavior: "smooth" });
    setDisplayIndex(index);
  };

  useEffect(() => {
    scrollContainerRef.current = slideRefs.current[0]?.parentElement ?? null;

    const observers: IntersectionObserver[] = [];
    slideRefs.current.forEach((slide, index) => {
      if (!slide) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            setDisplayIndex(index);
          }
        },
        { threshold: 0.6 }
      );
      observer.observe(slide);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div className="relative flex flex-col w-full gap-1 mt-10 ">
      <SfScrollable
        className="h-[500px] w-full snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        wrapperClassName="group/scrollable h-full"
        prevDisabled={displayIndex === 0}
        nextDisabled={displayIndex === images.length - 1}
        buttonsPlacement="block"
        onPrev={() => scrollToIndex(displayIndex - 1)}
        onNext={() => scrollToIndex(displayIndex + 1)}
        slotPreviousButton={
          <SfButton
            className="hidden group-hover/scrollable:block disabled:!hidden absolute !rounded-full !p-3 z-10 top-1/2 left-4 bg-white"
            variant="secondary"
            size="lg"
            slotPrefix={<SfIconChevronLeft />}
          />
        }
        slotNextButton={
          <SfButton
            className="hidden group-hover/scrollable:block disabled:!hidden absolute !rounded-full !p-3 z-10 top-1/2 right-4 bg-white"
            variant="secondary"
            size="lg"
            slotPrefix={<SfIconChevronRight />}
          />
        }
      >
        {images.map(
          (
            {
              imageSrc,
              alt,
              title,
              subtitle,
              buttonText,
              reverse,
              backgroundColor,
              description,
            },
            index,
          ) => (
            <div
              ref={(el) => { slideRefs.current[index] = el; }}
              className={classNames(
                "relative flex flex-col md:flex-row justify-center basis-full snap-center snap-always shrink-0 grow overflow-hidden gap-6",
                backgroundColor,
                { "md:flex-row-reverse": reverse },
              )}
            >
              {(title || subtitle || buttonText || description) && (
                <div className="w-full md:w-1/2 flex flex-col justify-center items-center text-center md:items-start md:text-start p-4 @sm:p-6 @3xl:p-10">
                  {subtitle && (
                    <p className="uppercase typography-text-xs block font-medium tracking-widest @3xl:typography-headline-6">
                      {subtitle}
                    </p>
                  )}
                  {title && (
                    <h2 className="mb-4 mt-2 font-semibold text-6xl">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mb-6 max-w-[400px] typography-text-base text-gray-700">
                      {description}
                    </p>
                  )}
                  {buttonText && (
                    <SfButton
                      blank
                      className="text-white bg-neutral-700 hover:bg-neutral-800 active:bg-neutral-900 pointer-events-none"
                      tabIndex={-1}
                    >
                      {buttonText}
                    </SfButton>
                  )}
                </div>
              )}
              <div className={classNames("w-full md:h-full overflow-hidden", { "md:w-1/2": title || subtitle || buttonText || description })}>
                <img
                  src={imageSrc}
                  alt={alt}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          ),
        )}
      </SfScrollable>
      <div className="shrink-0 basis-auto">
        <div className="flex-row w-full flex gap-0.5 mt [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {images.map(({ alt }, index) => (
            <button
              key={`${index}-bullet`}
              aria-label={alt}
              aria-current={displayIndex === index}
              type="button"
              className={classNames(
                "w-full relative mt-1 border-b-4 transition-colors focus-visible:outline focus-visible:outline-offset-0",
                {
                  "border-primary-700": displayIndex === index,
                  "border-gray-200": displayIndex !== index,
                },
              )}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
