"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

const TRACKED_BILLS = [
  {
    id: "AB 1234",
    subject: "Privacy",
    state: "Amended today",
    active: true,
    accent: "signal",
  },
  {
    id: "SB 567",
    subject: "Healthcare",
    state: "Yesterday",
    active: false,
    accent: "ember",
  },
  {
    id: "AB 890",
    subject: "Energy",
    state: "Monday",
    active: false,
    accent: "signal",
  },
  {
    id: "SB 12",
    subject: "Education",
    state: "Last week",
    active: false,
    accent: "ember",
  },
] as const;

export function LessonPreviewCard() {
  return (
    // Outer wrapper handles entrance (eased), inner handles hover (springy).
    // Splitting them avoids a transition-prop tug-of-war between the two.
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.15,
      }}
    >
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="rounded-[16px] bg-white p-2 transition-shadow duration-300 hover:shadow-[0_20px_48px_-16px_rgba(0,0,0,0.18)]"
        style={{
          boxShadow:
            "rgba(0, 0, 0, 0.4) 0px 0px 1px 0px, rgba(0, 0, 0, 0.04) 0px 4px 12px 0px",
        }}
      >
        <div className="border-chalk flex items-center justify-between rounded-[12px] border-b px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="bg-obsidian relative inline-flex size-4 items-center justify-center rounded-full">
              <motion.span
                aria-hidden
                className="bg-signal-blue absolute inset-0 rounded-full"
                animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.6, 1] }}
                transition={{
                  duration: 2.4,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
              <span className="bg-eggshell relative size-1 rounded-full" />
            </span>
            <span className="text-obsidian text-[13px] font-medium">
              AB 1234 · Acme Privacy Coalition
            </span>
          </div>
          <span className="text-gravel text-[12px]">High relevance</span>
        </div>

        <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-[180px_1fr]">
          <BillList />
          <ChatPreview />
        </div>
      </motion.div>
    </motion.div>
  );
}

function BillList() {
  return (
    <div className="hidden flex-col gap-1 sm:flex">
      <p className="text-gravel mb-1 px-2 text-[11px] tracking-[0.4px] uppercase">
        Watching
      </p>
      {TRACKED_BILLS.map((bill, i) => (
        <motion.div
          key={bill.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.5 + i * 0.06,
            ease: [0.22, 1, 0.36, 1],
          }}
          whileHover={{ x: 2 }}
          className={
            "flex cursor-default items-center gap-2.5 rounded-[8px] px-2 py-1.5 transition-colors " +
            (bill.active ? "bg-powder" : "hover:bg-powder/60")
          }
        >
          <motion.span
            aria-hidden
            className={
              "size-2 rounded-full " +
              (bill.accent === "signal" ? "bg-signal-blue" : "bg-ember")
            }
            animate={bill.active ? { scale: [1, 1.25, 1] } : undefined}
            transition={
              bill.active
                ? {
                    duration: 1.8,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }
                : undefined
            }
          />
          <span className="text-obsidian min-w-0 flex-1 truncate text-[13px] font-medium">
            {bill.id}
          </span>
          <span className="text-gravel text-[11px]">{bill.state}</span>
        </motion.div>
      ))}
    </div>
  );
}

function ChatPreview() {
  return (
    <div className="bg-eggshell flex flex-col gap-2 rounded-[12px] p-3">
      <ChatBubble role="ai" delay={0.7}>
        AB 1234 (amended today) extends CCPA opt-out requirements to data
        brokers. High relevance to Acme. They opposed the prior version last
        session.
      </ChatBubble>
      <ChatBubble role="user" delay={0.95}>
        Find related bills.
      </ChatBubble>
      <ChatBubble role="ai" delay={1.2}>
        Two: AB 89 (data broker registry, same author) and SB 311 (broader CPRA
        amendments). Both moving through Privacy & Consumer Protection.
      </ChatBubble>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.45 }}
        className="mt-1 flex items-center justify-between"
      >
        <span className="text-gravel text-[12px]">Memo ready →</span>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className="bg-obsidian text-eggshell hover:bg-cinder inline-flex h-7 cursor-pointer items-center rounded-full px-3 text-[12px] font-medium transition-colors"
        >
          Draft client memo
        </motion.button>
      </motion.div>
    </div>
  );
}

interface ChatBubbleProps {
  role: "ai" | "user";
  children: ReactNode;
  delay: number;
}

function ChatBubble({ role, children, delay }: ChatBubbleProps) {
  const fromX = role === "user" ? 12 : -12;
  if (role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, x: fromX, y: 4 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
        className="border-chalk text-obsidian ml-auto max-w-[85%] rounded-[12px] border bg-white px-3 py-2 text-[12.5px] leading-normal"
      >
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, x: fromX, y: 4 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className="text-obsidian max-w-[90%] text-[12.5px] leading-[1.55]"
    >
      {children}
    </motion.div>
  );
}
