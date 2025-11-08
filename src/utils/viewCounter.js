import { supabase } from "../supabaseClient";

// Format date to YYYY-MM-DD HH:mm
const formatDateTime = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

// Get the start and end of current day in ISO format
const getTodayRange = () => {
  const now = new Date();
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).toISOString();
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  ).toISOString();
  return { startOfDay, endOfDay };
};

// Configurable transfer time (hour and minute, 24-hour clock)
const TRANSFER_HOUR = 23; // 23 = 11 PM
const TRANSFER_MINUTE = 59; // :59 minutes

// Check if it's time to transfer (configurable time)
export const checkTransferTime = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const shouldTransfer = hours === TRANSFER_HOUR && minutes === TRANSFER_MINUTE;
  if (shouldTransfer) {
    console.log(
      `[ViewCounter] Transfer time check: YES - It's ${String(
        TRANSFER_HOUR
      ).padStart(2, "0")}:${String(TRANSFER_MINUTE).padStart(2, "0")}`
    );
  }
  return shouldTransfer;
};

// Transfer views from page_views to daily_page_views
export const transferDailyViews = async () => {
  try {
    console.log("[ViewCounter] Starting daily transfer...");
    const { startOfDay } = getTodayRange();

    // Get all records from page_views
    const { data: pageViews, error: fetchError } = await supabase
      .from("page_views")
      .select("*");

    if (fetchError) {
      console.error("Error fetching page views:", fetchError);
      return;
    }

    if (pageViews && pageViews.length > 0) {
      console.log(
        `[ViewCounter] Found ${pageViews.length} records to transfer`
      );
      // Insert into daily_page_views
      const now = new Date();
      const formattedDate = formatDateTime(now);
      const { error: insertError } = await supabase
        .from("daily_page_views")
        .insert(
          pageViews.map((view) => ({
            page_url: view.page_url,
            view_count: view.view_count,
            view_date: formattedDate,
          }))
        );

      if (insertError) {
        console.error("Error inserting daily views:", insertError);
        return;
      }

      // Clear page_views table
      const { error: deleteError } = await supabase
        .from("page_views")
        .delete()
        .neq("id", 0);

      if (deleteError) {
        console.error("Error clearing page_views:", deleteError);
      } else {
        console.log("[ViewCounter] Successfully cleared page_views table");
      }
    } else {
      console.log("[ViewCounter] No records found to transfer");
    }
  } catch (error) {
    console.error("Unexpected error in transferDailyViews:", error);
  }
};

// Immediately transfer current page_views into daily_page_views and clear page_views.
// This is like transferDailyViews but intended for on-demand or frequent transfers (e.g. every 1 minute for testing).
export const transferViewsNow = async () => {
  try {
    const now = new Date();
    const viewDate = formatDateTime(now);

    // Get all records from page_views
    const { data: pageViews, error: fetchError } = await supabase
      .from("page_views")
      .select("*");

    if (fetchError) {
      console.error(
        "Error fetching page views for immediate transfer:",
        fetchError
      );
      return;
    }

    if (pageViews && pageViews.length > 0) {
      // Insert into daily_page_views with current date
      const { error: insertError } = await supabase
        .from("daily_page_views")
        .insert(
          pageViews.map((view) => ({
            page_url: view.page_url,
            view_count: view.view_count,
            view_date: viewDate,
          }))
        );

      if (insertError) {
        console.error("Error inserting immediate daily views:", insertError);
        return;
      }

      // Clear page_views table
      const { error: deleteError } = await supabase
        .from("page_views")
        .delete()
        .neq("id", 0);

      if (deleteError) {
        console.error(
          "Error clearing page_views after immediate transfer:",
          deleteError
        );
      }
    }
  } catch (error) {
    console.error("Unexpected error in transferViewsNow:", error);
  }
};

// Periodic transfer helpers
let _dailyTransferInterval = null;
let _nextTransferTimeout = null;

// Calculate milliseconds until next configured transfer time
const getMsUntilNextTransfer = () => {
  const now = new Date();
  const target = new Date(now);
  target.setHours(TRANSFER_HOUR, TRANSFER_MINUTE, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  const ms = target - now;
  console.log(
    `[ViewCounter] Next transfer scheduled at ${target.toString()} (in ${Math.round(
      ms / 1000 / 60
    )} minutes)`
  );
  return ms;
};

// Start daily transfer at end of day (23:59)
export const startEndOfDayTransfer = () => {
  if (_dailyTransferInterval || _nextTransferTimeout) {
    // already running
    console.log("[ViewCounter] Transfer already scheduled - skipping");
    return () => {
      if (_dailyTransferInterval) clearInterval(_dailyTransferInterval);
      if (_nextTransferTimeout) clearTimeout(_nextTransferTimeout);
      _dailyTransferInterval = null;
      _nextTransferTimeout = null;
    };
  }

  console.log("[ViewCounter] Setting up scheduled transfer");
  // First, schedule the next transfer
  const msUntilNext = getMsUntilNextTransfer();
  _nextTransferTimeout = setTimeout(() => {
    console.log("[ViewCounter] Initial transfer timeout reached");

    // Check every minute for the configured transfer time
    _dailyTransferInterval = setInterval(() => {
      console.log("[ViewCounter] Checking if it's time to transfer...");
      if (checkTransferTime()) {
        console.log("[ViewCounter] It's transfer time - executing transfer");
        transferDailyViews();
      }
    }, 60000); // Check every minute

    _nextTransferTimeout = null;
  }, msUntilNext);

  return () => {
    if (_dailyTransferInterval) clearInterval(_dailyTransferInterval);
    if (_nextTransferTimeout) clearTimeout(_nextTransferTimeout);
    _dailyTransferInterval = null;
    _nextTransferTimeout = null;
  };
};

// Stop the running end-of-day transfer (if any)
export const stopEndOfDayTransfer = () => {
  if (_dailyTransferInterval) {
    clearInterval(_dailyTransferInterval);
    _dailyTransferInterval = null;
  }
  if (_nextTransferTimeout) {
    clearTimeout(_nextTransferTimeout);
    _nextTransferTimeout = null;
  }
};

// Get total historical views for a URL
export const getTotalViews = async (pageUrl) => {
  try {
    const { data, error } = await supabase
      .from("daily_page_views")
      .select("view_count")
      .eq("page_url", pageUrl);

    if (error) {
      console.error("Error fetching total views:", error);
      return 0;
    }

    return data.reduce((total, record) => total + record.view_count, 0);
  } catch (error) {
    console.error("Unexpected error in getTotalViews:", error);
    return 0;
  }
};

// Get total historical views by matching the numeric id at the end of the URL.
// This is useful when URL formatting may differ but the resource id is consistent.
export const getTotalViewsById = async (id) => {
  try {
    const pattern = `%/${id}`;
    const { data, error } = await supabase
      .from("daily_page_views")
      .select("view_count")
      .like("page_url", pattern);

    if (error) {
      console.error("Error fetching total views by id:", error);
      return 0;
    }

    return data.reduce((total, record) => total + record.view_count, 0);
  } catch (error) {
    console.error("Unexpected error in getTotalViewsById:", error);
    return 0;
  }
};

// Get today's views for a URL
export const getTodayViews = async (pageUrl) => {
  try {
    const { data, error } = await supabase
      .from("page_views")
      .select("view_count")
      .eq("page_url", pageUrl)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching today's views:", error);
      return 0;
    }

    return data?.view_count || 0;
  } catch (error) {
    console.error("Unexpected error in getTodayViews:", error);
    return 0;
  }
};

// Get today's views by matching the numeric id at the end of the URL.
export const getTodayViewsById = async (id) => {
  try {
    const pattern = `%/${id}`;
    const { data, error } = await supabase
      .from("page_views")
      .select("view_count")
      .like("page_url", pattern);

    if (error) {
      console.error("Error fetching today's views by id:", error);
      return 0;
    }

    // page_views may return multiple entries matching the pattern; sum them.
    return data.reduce((sum, record) => sum + (record.view_count || 0), 0);
  } catch (error) {
    console.error("Unexpected error in getTodayViewsById:", error);
    return 0;
  }
};
