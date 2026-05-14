import { ElementType, ComponentPropsWithoutRef } from 'react';

type Props<T extends ElementType = 'span'> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'as'>;

export const VisuallyHidden = <T extends ElementType = 'span'>({
  as: Tag = 'span' as T,
  ...props
}: Props<T>) => {
  const Component = Tag as ElementType;
  return <Component className="visually-hidden" {...props} />;
};
