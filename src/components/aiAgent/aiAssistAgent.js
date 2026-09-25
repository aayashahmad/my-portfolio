import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import AIAssistChat from "./aiAssistchat";

export default function AIAssistButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="assist">
      <AnimatePresence>{open && <AIAssistChat onClose={() => setOpen(false)} />}</AnimatePresence>
      <button
        className="assist__fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        aria-expanded={open}
      >
        <i className={open ? "fas fa-xmark" : "fas fa-comment-dots"} />
      </button>
    </div>
  );
}
