'use client'

import { useScroll, useSpring, motion } from 'framer-motion'

export function ReadingProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      className="fixed top-14 left-0 right-0 h-[3px] z-50 origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #007AFF 0%, #AF52DE 50%, #5AC8FA 100%)',
      }}
    />
  )
}
