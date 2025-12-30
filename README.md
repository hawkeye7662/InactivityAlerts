## A plugin for [Dragory's ModMail](https://github.com/dragory/modmailbot) that sends a message in threads that are inactive

**Currently on Version 1.0**  
Plugin written and maintained by [Hawk Eye](https://github.com/hawkeye7662) (hzwk on Discord)

## Installataion

In your config.ini file, create a new line and add

```
plugins[] = npm:hawkeye7662/InactivityAlerts
```

You need to restart the bot in order for the plugin to be loaded!

## Usage

### General

The bot will automatically check all open threads for inactivity.

### Notes

- A thread is considered inactive if no messages are sent to or from the user. Internal messages do not count as activity.
- Suspended threads are ignored.
- The bot checks for inactivity every 5 minutes, so the messages sent to alert inactivity may not be perfectly timed.
- If no message is sent to or from the user, the bot will not send inactivity alerts in this channel. (This may happen if you open a new thread with the newthread command and don't send or receive any messages in that thread)
- If the bot has already alerted inactivity, it won't send another alert until half the threshold time has passed. For example if the threshold for inactivity is 12 hours, and the thread has remained inactive for 24 hours, then there'll be alerts at 12 hours, 18 hours, and 24 hours of inactivity.

### Config

The default configuration is as follows:
|Property | Value |
|--|--|
|Low Threshold|12 hours|
|High Threshold| 24 hours|
|Ignore Closing Threads| true|
|Bumping Multiplier| 0.5|

You can change the default mappings in your `config.ini` file, under the `inactivityAlerts` configuration.
An example `config.ini` setup may look like this:

```ini
inactivityAlerts.lowThreshold = 43200000
inactivityAlerts.highThreshold = 86400000
inactivityAlerts.highThresholdCategories[] = 1191320772266954752
inactivityAlerts.highThresholdCategories[] = 713392854885728280
inactivityAlerts.ignoredCategories[] = 1203917358687719474
inactivityAlerts.ignoreClosingThreads = true
inactivityAlerts.bumpingMultiplier = 1
```

All categories not in highThresholdCategories will be considered low threshold categories, there's no configuration option for low threshold categories.

### Commands

#### Ignoring a channel

`!ignoreInactivity`
This will ignore the inactivity check in the current thread

#### Unignoring a channel

`!unignoreInactivity`
This will stop ignoring the inactivity check in the current thread

### Bugs

If you have found a bug, please report it at the [issues page for the plugin](https://github.com/hawkeye7662/InactivityAlerts/issues)!  
You can also find the plugin author (hzwk) on discord in case you have any specific questions.

### Feature Requests

If you want to request or suggest a feature, open an issue on the [plugins issue page](https://github.com/hawkeye7662/InactivityAlerts/issues)!
