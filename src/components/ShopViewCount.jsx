import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { getTotalViews, getTodayViews } from "../utils/viewCounter";

// ShopViewCount can accept either:
// - a single shop via props { shopId, name }
// - or an array of shops via props { shops: [{ id, name }, ...] }
// It will aggregate today's and historical views across the provided shops.
const ShopViewCount = ({ shopId, name, shops = [] }) => {
  const [historicalCount, setHistoricalCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const buildUrl = (shopName, id) => {
      const cleanName = (shopName || "").toLowerCase().replace(/\s+/g, "");
      return `${window.location.origin}/shop/${cleanName}/${id}`;
    };

    const fetchForSingle = async (id, shopName) => {
      try {
        const url = buildUrl(shopName, id);
        const t = await getTodayViews(url);
        const h = await getTotalViews(url);
        if (mounted) {
          setTodayCount(t);
          setHistoricalCount(h);
        }
      } catch (err) {
        console.error("Unexpected error fetching view counts:", err);
        if (mounted) {
          setTodayCount(0);
          setHistoricalCount(0);
        }
      }
    };

    const fetchForMultiple = async (shopsArr) => {
      try {
        let totalToday = 0;
        let totalHistorical = 0;
        // fetch serially to avoid overwhelming the client; number of shops should be small
        for (const s of shopsArr) {
          const url = buildUrl(s.name, s.id);
          // getTodayViews reads from page_views (single) and returns 0 if not present
          const t = await getTodayViews(url);
          const h = await getTotalViews(url);
          totalToday += t || 0;
          totalHistorical += h || 0;
        }
        if (mounted) {
          setTodayCount(totalToday);
          setHistoricalCount(totalHistorical);
        }
      } catch (err) {
        console.error("Unexpected error fetching aggregated view counts:", err);
        if (mounted) {
          setTodayCount(0);
          setHistoricalCount(0);
        }
      }
    };

    // Priority: if shops array provided and non-empty, aggregate those. Else fallback to single shopId/name.
    if (Array.isArray(shops) && shops.length > 0) {
      fetchForMultiple(shops);
    } else if (shopId) {
      fetchForSingle(shopId, name || "");
    } else {
      // nothing to fetch
      setTodayCount(0);
      setHistoricalCount(0);
    }

    return () => {
      mounted = false;
    };
  }, [shopId, name, JSON.stringify(shops)]);

  return (
    <>
      <span className="flex justify-center items-center gap-2">
        <span className="text-orange-400" title="Today's views">
          {todayCount ?? ""}
        </span>
        {/* <span className="text-blue-500 hidden sm:block" title="Total views">
          {"/ "}
          {historicalCount ?? ""}
        </span> */}
      </span>
    </>
  );
};

export default ShopViewCount;
