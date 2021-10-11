#!/usr/bin/env sh

DIR="/mnt/us"
DASH_PNG="$DIR/schedule.png"
FETCH_DASHBOARD_CMD="$DIR/capture.sh"

TIMEZONE=${TIMEZONE:-"America/New_York"}
REFRESH_SCHEDULE=${REFRESH_SCHEDULE:-"*/15 8-18 * * MON-FRI"}
FULL_DISPLAY_REFRESH_RATE=${FULL_DISPLAY_REFRESH_RATE:-0}
SLEEP_SCREEN_INTERVAL=${SLEEP_SCREEN_INTERVAL:-3600}
RTC=/sys/devices/platform/mxc_rtc.0/wakeup_enable

num_refresh=0

init() {
  echo "Starting dashboard with $REFRESH_SCHEDULE refresh..."

  /etc/init.d/framework stop
  initctl stop webreader >/dev/null 2>&1
  echo powersave >/sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
  lipc-set-prop com.lab126.powerd preventScreenSaver 1
}

prepare_sleep() {
  echo "Preparing sleep"

  /usr/sbin/eips -f -g $DASH_PNG

  # Give screen time to refresh
  sleep 2

  # Ensure a full screen refresh is triggered after wake from sleep
  num_refresh=$FULL_DISPLAY_REFRESH_RATE
}

refresh_dashboard() {
  echo "Refreshing dashboard"
  "$DIR/wait-for-wifi.sh"

  "$FETCH_DASHBOARD_CMD"
  fetch_status=$?

  if [ "$fetch_status" -ne 0 ]; then
    echo "Not updating screen, fetch-dashboard returned $fetch_status"
    return 1
  fi

  if [ "$num_refresh" -eq "$FULL_DISPLAY_REFRESH_RATE" ]; then
    num_refresh=0

    # trigger a full refresh once in every 4 refreshes, to keep the screen clean
    echo "Full screen refresh"
    /usr/sbin/eips -f -g "$DASH_PNG"
  else
    echo "Partial screen refresh"
    /usr/sbin/eips -g "$DASH_PNG"
  fi

  num_refresh=$((num_refresh + 1))
}

rtc_sleep() {
  duration=$1

  # shellcheck disable=SC2039
  [ "$(cat "$RTC")" -eq 0 ] && echo -n "$duration" >"$RTC"
  echo "mem" >/sys/power/state
}

main_loop() {
  while true; do
    next_wakeup_secs=$("$DIR/next-wakeup" --schedule="$REFRESH_SCHEDULE" --timezone="$TIMEZONE")

    if [ "$next_wakeup_secs" -gt "$SLEEP_SCREEN_INTERVAL" ]; then
      action="sleep"
      prepare_sleep
    else
      action="suspend"
      refresh_dashboard
    fi

    # take a bit of time before going to sleep, so this process can be aborted
    sleep 10

    echo "Going to $action, next wakeup in ${next_wakeup_secs}s"

    rtc_sleep "$next_wakeup_secs"
  done
}

init
main_loop
