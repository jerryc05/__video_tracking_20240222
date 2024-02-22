#!/usr/bin/env sh

[ "$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "$1")" = "mpeg4" ] &&
  ffmpeg -i "$1" -c:v libx264 -preset faster -c:a aac -vf format=yuv420p -movflags +faststart "$1.mp4"
