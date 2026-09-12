"use client";

import { useEffect, useRef } from "react";

const IMPRESSION_URL = "/api/proxy/public/track/impression";
const CLICK_URL = "/api/proxy/public/track/click";
const IMPRESSION_DEDUPE_MS = 30 * 60 * 1000;
const VIEWABLE_RATIO = 0.5;
const VIEWABLE_DURATION_MS = 1000;

function impressionStorageKey(campaignId) {
   return `agri-noria:ad-impression:${campaignId}`;
}

function recentlyTracked(campaignId) {
   if (typeof window === "undefined") return false;
   const lastTracked = Number(window.localStorage.getItem(impressionStorageKey(campaignId)));
   return Number.isFinite(lastTracked) && Date.now() - lastTracked < IMPRESSION_DEDUPE_MS;
}

function markTracked(campaignId) {
   if (typeof window === "undefined") return;
   window.localStorage.setItem(impressionStorageKey(campaignId), String(Date.now()));
}

export async function trackAdClick(campaignId) {
   if (!campaignId) return;
   await fetch(CLICK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId }),
      keepalive: true,
   });
}

export function useViewableAdImpression(targetRef, campaignId, rootRef) {
   const timeoutRef = useRef(null);
   const trackedRef = useRef(false);

   useEffect(() => {
      trackedRef.current = false;
   }, [campaignId]);

   useEffect(() => {
      const target = targetRef.current;
      if (!campaignId || !target || trackedRef.current || recentlyTracked(campaignId)) return undefined;

      const clearViewTimer = () => {
         if (!timeoutRef.current) return;
         window.clearTimeout(timeoutRef.current);
         timeoutRef.current = null;
      };

      const observer = new IntersectionObserver(
         ([entry]) => {
            if (trackedRef.current || recentlyTracked(campaignId)) {
               clearViewTimer();
               observer.disconnect();
               return;
            }

            if (entry.isIntersecting && entry.intersectionRatio >= VIEWABLE_RATIO && document.visibilityState === "visible") {
               if (timeoutRef.current) return;
               timeoutRef.current = window.setTimeout(async () => {
                  trackedRef.current = true;
                  try {
                     const res = await fetch(IMPRESSION_URL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ campaignId }),
                        keepalive: true,
                     });
                     if (res.ok) markTracked(campaignId);
                  } catch (err) {
                     console.error("Failed to track impression:", err);
                  } finally {
                     clearViewTimer();
                     observer.disconnect();
                  }
               }, VIEWABLE_DURATION_MS);
               return;
            }

            clearViewTimer();
         },
         { root: rootRef?.current || null, threshold: [0, VIEWABLE_RATIO, 1] },
      );

      observer.observe(target);
      return () => {
         clearViewTimer();
         observer.disconnect();
      };
   }, [campaignId, rootRef, targetRef]);
}
