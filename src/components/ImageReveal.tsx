import { motion } from 'framer-motion';
type ImageProps = { src: string; alt: string; className?: string; loading?: 'eager' | 'lazy' };
export default function ImageReveal({ className = '', src, alt, loading }: ImageProps) { return <motion.img src={src} alt={alt} loading={loading} className={className} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />; }
