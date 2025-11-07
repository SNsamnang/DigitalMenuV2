import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

// TrackPageView: only increment view when the user remains visible on the page
// for a total of 10 seconds (accumulated visible time). Uses sessionStorage
// to avoid double-counting within the same browser tab/session for the same URL.
const TrackPageView = () => {
  const { name, shopId } = useParams();
  const [viewCount, setViewCount] = useState(0);
  const [hostname, setHostname] = useState("");

  // Helper function to update shop URLs with new name
  const updateShopUrls = async (oldShopUrl, newShopUrl) => {
    try {
      // Extract the old name and shop ID from the URL
      const oldUrlParts = oldShopUrl.split("/");
      const newUrlParts = newShopUrl.split("/");

      // Only proceed if we have the same shop ID but different names
      if (
        oldUrlParts[oldUrlParts.length - 1] ===
          newUrlParts[newUrlParts.length - 1] &&
        oldUrlParts[oldUrlParts.length - 2] !==
          newUrlParts[newUrlParts.length - 2]
      ) {
        // Update page_views records
        const { error: updateError } = await supabase
          .from("page_views")
          .update({ page_url: newShopUrl })
          .eq("page_url", oldShopUrl);

        if (updateError) {
          console.error("Error updating shop URLs:", updateError);
        }

        // Update daily_page_views records
        const { error: dailyUpdateError } = await supabase
          .from("daily_page_views")
          .update({ page_url: newShopUrl })
          .eq("page_url", oldShopUrl);

        if (dailyUpdateError) {
          console.error("Error updating daily shop URLs:", dailyUpdateError);
        }
      }
    } catch (err) {
      console.error("Error in updateShopUrls:", err);
    }
  };

  // Accumulated visible time in ms
  const accumulatedRef = useRef(0);
  const visibleStartRef = useRef(null);
  const intervalRef = useRef(null);
  const countedRef = useRef(false);

  useEffect(() => {
    setHostname(window.location.origin || "");
  }, []);

  useEffect(() => {
    if (!hostname || !name || !shopId) return;

    const shopUrl = `${hostname}/shop/${name.toLowerCase()}/${shopId}`;
    const sessionKey = `pv_counted:${shopUrl}`;

    // Helper: fetch current count (if any) and update state
    const fetchCurrentCount = async () => {
      try {
        // Get records by shopId, regardless of the full URL
        const { data: records, error } = await supabase
          .from("page_views")
          .select("view_count")
          .like("page_url", `%/${shopId}`)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching current page view:", error);
          return;
        }

        // Update the state with the view count if found
        if (records?.view_count != null) {
          setViewCount(records.view_count);
        }
      } catch (err) {
        // ignore fetch error for display
        console.error("Error fetching current page view:", err);
      }
    };

    fetchCurrentCount();

    // If already counted in this session/tab, don't increment again.
    if (sessionStorage.getItem(sessionKey)) {
      countedRef.current = true;
      return;
    }

    // Start tracking visible time
    const tick = () => {
      if (document.visibilityState === "visible") {
        if (!visibleStartRef.current) visibleStartRef.current = Date.now();
        const now = Date.now();
        const delta = now - visibleStartRef.current;
        accumulatedRef.current += delta;
        visibleStartRef.current = now;

        // reached 10 seconds (10000 ms) of visible time => increment
        if (accumulatedRef.current >= 10000 && !countedRef.current) {
          countedRef.current = true;
          incrementCount();
          clearInterval(intervalRef.current);
        }
      } else {
        // page hidden -> pause timer
        visibleStartRef.current = null;
      }
    };

    // Increment function: update or insert row and update UI + sessionStorage
    const incrementCount = async () => {
      try {
        // First try to find any existing record with the same shopId
        const { data: existingRecords, error: fetchError } = await supabase
          .from("page_views")
          .select("*")
          .like("page_url", `%/${shopId}`);

        if (fetchError) {
          console.error("Error fetching page_views record:", fetchError);
          return;
        }

        const existing = existingRecords?.[0]; // Take the first matching record if any

        if (existing) {
          // Update the record, also updating the URL to the current one
          const { data: updated, error: updateError } = await supabase
            .from("page_views")
            .update({
              view_count: existing.view_count + 1,
              page_url: shopUrl, // Update to current URL
            })
            .eq("id", existing.id) // Use record ID for precise update
            .select()
            .single();

          if (!updateError && updated) setViewCount(updated.view_count);
        } else {
          const { data: inserted, error: insertError } = await supabase
            .from("page_views")
            .insert({ page_url: shopUrl, view_count: 1 })
            .select()
            .single();

          if (!insertError && inserted) setViewCount(inserted.view_count);
        }

        // mark counted for this session/tab so reloads in same tab won't double-count
        sessionStorage.setItem(sessionKey, "1");
      } catch (err) {
        console.error("Error incrementing page view:", err);
      }
    };

    // set a short interval to accumulate visible time (200ms precision)
    intervalRef.current = setInterval(tick, 200);

    // also listen to visibilitychange to ensure we handle tab hide/show
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        // pause timing
        visibleStartRef.current = null;
      } else {
        // resume
        visibleStartRef.current = Date.now();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    // cleanup on unmount
    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [hostname, name, shopId]);

  return (
    <div className="text-center my-2 text-gray-600 hidden">
      <p>Shop views: {viewCount}</p>
    </div>
  );
};

export default TrackPageView;
