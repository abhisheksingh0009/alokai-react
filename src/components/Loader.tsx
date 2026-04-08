import { SfLoaderCircular, type SfLoaderCircularProps } from '@storefront-ui/react';

export default function Loader({ size = 'base', className }: Pick<SfLoaderCircularProps, 'size' | 'className'>) {
  return <SfLoaderCircular size={size} className={className} />;
}
