const CONFIG_KEY = "inactivityAlerts";
module.exports = async function ({ bot, threads, config, commands }) {
  const {
    lowThreshold = 12 * 60 * 60 * 1000, // 12 hours default
    highThreshold = 24 * 60 * 60 * 1000, // 24 hours default
    highThresholdCategories = [],
    ignoredCategories = [],
    ignoreClosingThreads = true,
  } = config[CONFIG_KEY] || {};

  // 5 minute cron job
  checkInactiveThreads(
    bot,
    threads,
    lowThreshold,
    highThreshold,
    highThresholdCategories,
    ignoredCategories,
    ignoreClosingThreads,
  );
  commands.addInboxThreadCommand(
    "ignoreInactivity",
    [],
    async (_msg, _args, thread) => {
      if (thread.getMetadataValue("ignoreInactivityAlerts")) {
        thread.postSystemMessage(
          `This thread is already set to be ignored for inactivity alerts.`,
        );
        return;
      }
      thread.setMetadataValue("ignoreInactivityAlerts", true);
      thread.postSystemMessage(
        `This thread will now be ignored for inactivity alerts.`,
      );
    },
  );
  commands.addInboxThreadCommand(
    "unignoreInactivity",
    [],
    async (_msg, _args, thread) => {
      if (!thread.getMetadataValue("ignoreInactivityAlerts")) {
        thread.postSystemMessage(
          `This thread is not set to be ignored for inactivity alerts.`,
        );
        return;
      }
      thread.setMetadataValue("ignoreInactivityAlerts", false);
      thread.postSystemMessage(
        `This thread will no longer be ignored for inactivity alerts.`,
      );
    },
  );
  setInterval(
    () => {
      checkInactiveThreads(
        bot,
        threads,
        lowThreshold,
        highThreshold,
        highThresholdCategories,
        ignoredCategories,
        ignoreClosingThreads,
      );
    },
    5 * 60 * 1000,
  );
};

function formatDuration(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  const parts = [];

  if (weeks > 0) {
    parts.push(`${weeks} week${weeks !== 1 ? "s" : ""}`);
  }
  if (days % 7 > 0) {
    parts.push(`${days % 7} day${days % 7 !== 1 ? "s" : ""}`);
  }
  if (hours % 24 > 0) {
    parts.push(`${hours % 24} hour${hours % 24 !== 1 ? "s" : ""}`);
  }
  if (minutes % 60 > 0) {
    parts.push(`${minutes % 60} minute${minutes % 60 !== 1 ? "s" : ""}`);
  }
  if (seconds % 60 > 0 && parts.length === 0) {
    // Only show seconds if no larger units
    parts.push(`${seconds % 60} second${seconds % 60 !== 1 ? "s" : ""}`);
  }

  if (parts.length === 0) return "0 seconds";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts.join(" and ");

  // For 3+ parts, join with commas and 'and' before the last one
  return parts.slice(0, -1).join(", ") + ", and " + parts[parts.length - 1];
}

async function checkInactiveThreads(
  bot,
  threads,
  lowThreshold,
  highThreshold,
  highThresholdCategories,
  ignoredCategories,
  ignoreClosingThreads,
) {
  const openThreads = await threads.getAllOpenThreads();

  for (const thread of openThreads) {
    if (ignoreClosingThreads && thread.scheduled_close_at) continue;

    const channel = await bot.getChannel(thread.channel_id);
    const categoryId = channel?.parentID || null;

    // Skip if category is in ignored list
    if (categoryId && ignoredCategories.includes(categoryId)) {
      continue;
    }

    const latestMessage = await thread.getLatestThreadMessage();

    if (!latestMessage || !latestMessage.created_at) {
      continue;
    }

    // Check if thread is set to ignore inactivity alerts
    const ignoreAlerts = thread.getMetadataValue("ignoreInactivityAlerts");
    if (ignoreAlerts) {
      continue;
    }

    const now = new Date();
    const created_at = new Date(latestMessage.created_at + "Z");
    const difference = now - created_at;

    // Determine which threshold to use based on category
    const threshold =
      categoryId && highThresholdCategories.includes(categoryId)
        ? highThreshold
        : lowThreshold;

    // Get last bump time (defaults to null if never bumped)
    const lastBumpedAt = thread.getMetadataValue("bumpedAt");
    const timeSinceLastBump = lastBumpedAt
      ? now - new Date(lastBumpedAt)
      : Infinity; // If never bumped, treat as infinite time

    // Check if thread exceeds the applicable threshold
    if (difference > threshold && timeSinceLastBump > threshold / 2) {
      const durationString = formatDuration(threshold);
      thread.postNonLogMessage(
        `This thread has been inactive for more than ${durationString}.`,
      );
      thread.setMetadataValue("bumpedAt", new Date().toISOString());
    }
  }
}
