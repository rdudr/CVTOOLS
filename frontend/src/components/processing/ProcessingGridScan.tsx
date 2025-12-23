"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GridScan } from "@/components/GridScan";
import type { ProcessingGridScanProps } from "@/types/processing";
import { GRIDSCAN_CONFIG } from "@/types/processing";

/**
 * ProcessingGridScan Component
 * Wrapper for GridScan that provides processing feedback background
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

export const ProcessingGridScan: React.FC<ProcessingGridScanProps> = ({
  isActive,
  onFadeComplete,
}) => {
  return (
    <AnimatePresence onExitComplete={onFadeComplete}>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-0 pointer-events-none"
        >
          <GridScan
            enableWebcam={false}
            showPreview={false}
            linesColor={GRIDSCAN_CONFIG.linesColor}
            scanColor={GRIDSCAN_CONFIG.scanColor}
            scanOpacity={GRIDSCAN_CONFIG.scanOpacity}
            gridScale={GRIDSCAN_CONFIG.gridScale}
            lineStyle={GRIDSCAN_CONFIG.lineStyle}
            scanDirection={GRIDSCAN_CONFIG.scanDirection}
            scanDuration={GRIDSCAN_CONFIG.scanDuration}
            scanDelay={GRIDSCAN_CONFIG.scanDelay}
            enablePost={GRIDSCAN_CONFIG.enablePost}
            bloomIntensity={GRIDSCAN_CONFIG.bloomIntensity}
            chromaticAberration={GRIDSCAN_CONFIG.chromaticAberration}
            className="w-full h-full"
            style={{}}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProcessingGridScan;
