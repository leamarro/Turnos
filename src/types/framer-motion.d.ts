declare module 'framer-motion' {
  import { ComponentType, ReactNode, HTMLAttributes } from 'react';

  export interface MotionProps {
    initial?: any;
    animate?: any;
    exit?: any;
    variants?: any;
    transition?: any;
    whileHover?: any;
    whileTap?: any;
    whileInView?: any;
    layout?: boolean | string;
    layoutId?: string;
    style?: any;
    className?: string;
    children?: ReactNode;
    key?: string;
    onAnimationComplete?: () => void;
    ref?: any;
    [key: string]: any;
  }

  export type MotionDiv = ComponentType<MotionProps & HTMLAttributes<HTMLDivElement>>;

  export const motion: {
    div: MotionDiv;
    span: ComponentType<MotionProps & HTMLAttributes<HTMLSpanElement>>;
    button: ComponentType<MotionProps & HTMLAttributes<HTMLButtonElement>>;
    a: ComponentType<MotionProps & HTMLAttributes<HTMLAnchorElement>>;
    section: MotionDiv;
    main: MotionDiv;
    header: MotionDiv;
    footer: MotionDiv;
    nav: MotionDiv;
    aside: MotionDiv;
    article: MotionDiv;
    p: ComponentType<MotionProps & HTMLAttributes<HTMLParagraphElement>>;
    h1: ComponentType<MotionProps & HTMLAttributes<HTMLHeadingElement>>;
    h2: ComponentType<MotionProps & HTMLAttributes<HTMLHeadingElement>>;
    h3: ComponentType<MotionProps & HTMLAttributes<HTMLHeadingElement>>;
    h4: ComponentType<MotionProps & HTMLAttributes<HTMLHeadingElement>>;
    img: ComponentType<MotionProps & HTMLAttributes<HTMLImageElement>>;
    ul: MotionDiv;
    li: MotionDiv;
    svg: ComponentType<MotionProps & any>;
    [key: string]: any;
  };

  export const AnimatePresence: ComponentType<{
    children?: ReactNode;
    mode?: 'wait' | 'sync' | 'popLayout';
    initial?: boolean;
    onExitComplete?: () => void;
  }>;

  export const useAnimation: () => any;
  export const useMotionValue: (value: number) => any;
  export const useTransform: (value: any, input: number[], output: number[]) => any;
  export const useScroll: () => any;
  export const useInView: (ref: any, options?: any) => boolean;
}
