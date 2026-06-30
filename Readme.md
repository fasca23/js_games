
## 🚀 Быстрый старт

### Разработка
Откройте `index.html` в браузере.

### Сборка продакшен-версии

```bash
# Установка зависимостей
npm install

# Сборка в один файл
npm run build

# Проверить размеры
npm run size



npm init -y
npm install html-inline --save-dev
npx html-inline index.html > index_bundle.html
RUN - index_bundle.html

npm run build
npm run size

npm install --save-dev uglify-js
npx uglifyjs snake.js --compress --mangle --output snake.min.js