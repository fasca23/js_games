# Сборка в 3 отдельных файла (dist/index.html, dist/style.css, dist/game.js)
python build.py

# Сборка в 1 HTML файл (index_bundle.html)
python build.py single

# Сборка в Jinja2 шаблон (pacman_template_bundle.html)
python build.py template

# Все три варианта сразу
python build.py all

# Справка
python build.py help