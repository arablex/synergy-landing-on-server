#!/usr/bin/env bash
# Выгрузка лендинга на сервер (аналог Cyberduck/WinSCP, но командой).
# Использование: ./deploy/deploy.sh user@IP-СЕРВЕРА
# Пример:        ./deploy/deploy.sh root@203.0.113.10
set -euo pipefail

TARGET="${1:?Укажите сервер: ./deploy/deploy.sh user@IP}"
REMOTE_DIR="/var/www/landing"
cd "$(dirname "$0")/.."

echo "==> Создаём папку на сервере"
ssh "$TARGET" "sudo mkdir -p $REMOTE_DIR && sudo chown \$USER:\$USER $REMOTE_DIR"

echo "==> Копируем файлы сайта (rsync по SSH)"
rsync -avz --delete site/ "$TARGET:$REMOTE_DIR/"

echo "==> Проверяем и перезагружаем nginx"
ssh "$TARGET" "sudo nginx -t && sudo systemctl reload nginx"

echo "Готово. Откройте сайт в браузере и проверьте, что он доступен извне."
