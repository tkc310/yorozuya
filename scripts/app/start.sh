#!/bin/bash
# サーバを裏で立て、準備ができたらブラウザで開く。立てたサーバの PID を出力する。
set -eu

contents="$(cd "$(dirname "$0")/.." && pwd)"
support="$HOME/Library/Application Support/Yorozuya"
port=4628
url="http://127.0.0.1:$port/"

# 既に起動していれば開くだけにする。
if curl -fsS -o /dev/null "$url" 2>/dev/null; then
  open "$url"
  exit 0
fi

# DB は作業ディレクトリの data/yorozuya.db に置く。マイグレーションは毎回入れ替える。
mkdir -p "$support/src/server/db"
rm -rf "$support/src/server/db/migrations"
cp -R "$contents/Resources/migrations" "$support/src/server/db/migrations"
cd "$support"

YOROZUYA_CLIENT_DIR="$contents/Resources/client" PORT="$port" \
  "$contents/MacOS/yorozuya-server" </dev/null >>"$support/server.log" 2>&1 &
server=$!

for _ in $(seq 1 50); do
  if curl -fsS -o /dev/null "$url" 2>/dev/null; then
    break
  fi
  sleep 0.2
done

open "$url"
echo "$server"
