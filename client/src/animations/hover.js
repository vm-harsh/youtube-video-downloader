import { gsap } from 'gsap';

export function attachButtonHover(element) {
  if (!element) {
    return () => {};
  }

  const enter = () => gsap.to(element, { scale: 1.035, duration: 0.18, ease: 'power2.out' });
  const leave = () => gsap.to(element, { scale: 1, duration: 0.18, ease: 'power2.out' });

  element.addEventListener('mouseenter', enter);
  element.addEventListener('mouseleave', leave);

  return () => {
    element.removeEventListener('mouseenter', enter);
    element.removeEventListener('mouseleave', leave);
  };
}
