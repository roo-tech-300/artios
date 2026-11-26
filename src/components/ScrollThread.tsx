import { motion, useScroll, useSpring } from 'framer-motion';

// A gold thread across the top of the page that fills as you read.
export default function ScrollThread() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return <motion.div className="scroll-thread" style={{ scaleX }} aria-hidden="true" />;
}
