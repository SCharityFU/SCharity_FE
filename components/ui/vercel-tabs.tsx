"use client";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface TabData {
    label: string;
    value: string;
    content: React.ReactNode;
}

interface VercelTabsProps {
    tabs: TabData[];
    defaultTab?: string;
    className?: string;
}

export function VercelTabs({ tabs, defaultTab, className }: VercelTabsProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.value);
    const [hoverStyle, setHoverStyle] = useState({});
    const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" });
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const activeIndex = tabs.findIndex((tab) => tab.value === activeTab);

    useEffect(() => {
        if (hoveredIndex !== null) {
            const hoveredElement = tabRefs.current[hoveredIndex];
            if (hoveredElement) {
                const { offsetLeft, offsetWidth } = hoveredElement;
                setHoverStyle({ left: `${offsetLeft}px`, width: `${offsetWidth}px` });
            }
        }
    }, [hoveredIndex]);

    useEffect(() => {
        const activeElement = tabRefs.current[activeIndex];
        if (activeElement) {
            const { offsetLeft, offsetWidth } = activeElement;
            setActiveStyle({ left: `${offsetLeft}px`, width: `${offsetWidth}px` });
        }
    }, [activeIndex]);

    useEffect(() => {
        requestAnimationFrame(() => {
            const activeElement = tabRefs.current[activeIndex];
            if (activeElement) {
                const { offsetLeft, offsetWidth } = activeElement;
                setActiveStyle({ left: `${offsetLeft}px`, width: `${offsetWidth}px` });
            }
        });
    }, [activeIndex]);

    return (
        <div className={`flex w-full flex-col items-center ${className ?? ""}`}>
            <div className="relative flex h-auto select-none gap-[6px] bg-transparent p-0">
                {/* Hover Highlight */}
                <div
                    className="absolute top-0 left-0 flex h-[30px] items-center rounded-[6px] bg-white/10 transition-all duration-300 ease-out"
                    style={{ ...hoverStyle, opacity: hoveredIndex !== null ? 1 : 0 }}
                />
                {/* Active Indicator */}
                <div
                    className="absolute bottom-[-6px] h-[2px] bg-rose-400 transition-all duration-300 ease-out"
                    style={activeStyle}
                />
                {tabs.map((tab, index) => (
                    <button
                        key={tab.value}
                        ref={(el) => { tabRefs.current[index] = el; }}
                        onClick={() => setActiveTab(tab.value)}
                        className={`z-10 h-[30px] cursor-pointer rounded-md border-0 bg-transparent px-3 py-2 outline-none transition-colors duration-300 ${activeTab === tab.value ? "text-black" : "text-black/60"
                            }`}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <span className="whitespace-nowrap font-medium text-sm leading-5">{tab.label}</span>
                    </button>
                ))}
            </div>
            {/* Content Area */}
            <div className="mt-8 w-full">
                {tabs.map((tab) => (
                    <div
                        key={tab.value}
                        className={`w-full transition-all duration-500 ${activeTab === tab.value ? "block" : "hidden"}`}
                    >
                        {tab.content}
                    </div>
                ))}
            </div>
        </div>
    );
}
