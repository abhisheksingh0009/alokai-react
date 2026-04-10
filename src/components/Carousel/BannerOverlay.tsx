import { SfButton } from '@storefront-ui/react';
import bannerOverlayImg from '../../assets/banner-overlay.png';

const displayDetails = [
  {
    title: 'Cap Game Strong',
    subtitle: 'Special Offer',
    description: 'Score serious style points with our Open Capsule collection',
    buttonText: 'Coming Soon....',
    backgroundImage: bannerOverlayImg,
  },
];

export default function BannerOverlay() {
  return (
    <div className="max-w-[1540px]">
      {displayDetails.map(({ title, subtitle, description, buttonText, backgroundImage }) => (
        <div key={title} className="relative flex text-white max-w-[1536px] @container group">
          <a
            className="absolute w-full h-full z-1 focus-visible:outline focus-visible:rounded-lg"
            aria-label={title}
            href="#"
          />
          <div className="h-[680px] @3xl:h-auto @3xl:aspect-[2] flex justify-center overflow-hidden grow">
            <div className="z-[9999] relative grow flex flex-col justify-center items-center text-center p-4 @sm:p-6 @3xl:p-10 max-w-1/2">
              <p className="uppercase text-lg block font-medium tracking-widest">
                {subtitle}
              </p>
              <h2 className="mb-4 mt-2 font-semibold text-3xl md:text-6xl text-white">
                {title}
              </h2>
              <p className="typography-text-base block mb-4 text-base">{description}</p>
              <SfButton
                blank
                className="w-[200px] bg-white text-primary-700 ring-secondary-400 group-hover:bg-primary-100 group-hover:hover:text-primary-800 group-hover:ring-secondary-500 group-active:bg-primary-200 group-active:text-primary-900 group-active:ring-secondary-600 group-has-[:focus-visible]:outline group-has-[:focus-visible]:outline-offset pointer-events-none"
                tabIndex={-1}
                variant="secondary"
              >
                {buttonText}
              </SfButton>
            </div>
            <div className="absolute inset-0 z-[10] overflow-hidden bg-primary-900">
              <img src={backgroundImage} alt={title} className="w-full h-full object-cover opacity-75" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
