import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

export default function AnimatedOutlet() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const isForward = navigationType !== 'POP';

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ x: isForward ? '100%' : '-25%', opacity: isForward ? 1 : 0.6 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: isForward ? '-25%' : '100%', opacity: isForward ? 0.6 : 1 }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        style={{ width: '100%', willChange: 'transform' }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}