import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component
 * 
 * Production-ready scroll restoration fix:
 * 1. Configures browser history scroll restoration to 'manual' to prevent native scroll jumps.
 * 2. Synchronously resets standard viewport scroll and layout container scrolls immediately.
 * 3. Schedules duplicate resets inside subsequent 'requestAnimationFrame' frames to combat layout shifts
 *    from asynchronously loaded components or Framer Motion enter animations.
 * 4. Logs before & after scroll metrics to verify successful reset on every navigation.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  // Configure standard manual scroll restoration on mount
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      const originalRestoration = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
      console.log(`[ScrollToTop] Configured browser scroll restoration to 'manual' (previous: '${originalRestoration}')`);
      
      return () => {
        window.history.scrollRestoration = originalRestoration;
        console.log(`[ScrollToTop] Restored browser scroll restoration to '${originalRestoration}'`);
      };
    }
  }, []);

  useEffect(() => {
    // Audit current coordinates prior to scroll reset
    const preWindowY = window.scrollY || window.pageYOffset;
    const preDocElementY = document.documentElement.scrollTop;
    const preDocBodyY = document.body.scrollTop;
    console.log(`[ScrollToTop] Route changed to: ${pathname}`);
    console.log(`[ScrollToTop] PRE-SCROLL - window.scrollY: ${preWindowY}, html: ${preDocElementY}, body: ${preDocBodyY}`);

    const performScrollReset = () => {
      // 1. Reset standard browser window viewport
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant"
      });

      // 2. Reset HTML & Body scrollTop directly to bypass edge-case browser behaviors
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // 3. Reset internal scrollable container elements (e.g. <main className="overflow-y-auto"> in Admin Panel)
      const scrollContainers = document.querySelectorAll("main, .overflow-y-auto");
      scrollContainers.forEach((container) => {
        container.scrollTo({
          top: 0,
          left: 0,
          behavior: "instant"
        });
        container.scrollTop = 0;
      });
    };

    // First Layout Pass: Synchronous scroll reset
    performScrollReset();

    // Second Layout Pass: Guard against layout shifts, Framer Motion animations, or async loading
    let rafId1;
    let rafId2;

    rafId1 = requestAnimationFrame(() => {
      performScrollReset();
      rafId2 = requestAnimationFrame(() => {
        performScrollReset();
        
        // Log final scroll positions once all layout passes have settled
        const postWindowY = window.scrollY || window.pageYOffset;
        const postDocElementY = document.documentElement.scrollTop;
        const postDocBodyY = document.body.scrollTop;
        console.log(`[ScrollToTop] POST-SCROLL - window.scrollY: ${postWindowY}, html: ${postDocElementY}, body: ${postDocBodyY}`);
      });
    });

    return () => {
      if (rafId1) cancelAnimationFrame(rafId1);
      if (rafId2) cancelAnimationFrame(rafId2);
    };
  }, [pathname]);

  return null;
}
