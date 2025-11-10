import { Link, useLocation } from "react-router-dom";
import { Home, Search, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const navItems = [
    { to: "/", label: "Home", Icon: Home },
    { to: "/search", label: "Search", Icon: Search },
    { to: "/profile", label: "Profile", Icon: User },
];

export default function SideBar() {
    const location = useLocation();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
    const [indicatorStyle, setIndicatorStyle] = useState<{ top: number; height: number }>({ top: 0, height: 0 });

    useEffect(() => {
        // find active index by pathname
        const idx = navItems.findIndex((n) => n.to === location.pathname);
        const activeIndex = idx >= 0 ? idx : 0;

        const activeEl = itemRefs.current[activeIndex];
        const containerEl = containerRef.current;
        if (activeEl && containerEl) {
            const containerRect = containerEl.getBoundingClientRect();
            const itemRect = activeEl.getBoundingClientRect();
            const top = itemRect.top - containerRect.top + 8; // account for padding
            const height = itemRect.height - 16; // give indicator a bit of vertical padding
            setIndicatorStyle({ top, height });
        }
    }, [location.pathname]);

    return (
        <aside className="app-sidebar relative" ref={containerRef}>
            <div className="flex items-center justify-center mb-4">
                <div className="w-8 h-8 rounded-full bg-sidebar-foreground/10" />
            </div>

            {/* moving indicator */}
            <div
                aria-hidden
                className="absolute left-0 w-1 rounded-r-full bg-accent transition-all duration-300"
                style={{ top: indicatorStyle.top, height: indicatorStyle.height }}
            />

            <nav className="flex flex-col items-center gap-4">
                {navItems.map((item, i) => {
                    const active = location.pathname === item.to;
                    return (
                          <Link
                            key={item.to}
                            to={item.to}
                          ref={(el) => { itemRefs.current[i] = el }}
                            aria-label={item.label}
                            className={`w-12 h-12 flex items-center justify-center rounded-md transition-colors ${
                                active ? "text-sidebar-primary" : "text-sidebar-foreground/70"
                            }`}
                        >
                            <item.Icon size={20} />
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}