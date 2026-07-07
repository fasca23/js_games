#!/usr/bin/env python3
"""
Сборщик Pac-Man игры.
Собирает все JS и CSS файлы в один HTML файл.
Режимы сборки:
1. python build.py          - сборка в 3 файла (dist/)
2. python build.py single   - сборка в 1 файл (index_bundle.html)
3. python build.py template - сборка в Jinja2 шаблон (pacman_template_bundle.html)
4. python build.py all      - все варианты сборки
"""

import re
import os
import sys
import subprocess

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    # Создаем директорию, если она указана и не существует
    dir_name = os.path.dirname(path)
    if dir_name:  # Проверяем, что путь содержит директорию
        os.makedirs(dir_name, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def minify_css(css):
    """Минификация CSS"""
    # Удаляем комментарии
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)
    # Удаляем пробелы
    css = re.sub(r'\s+', ' ', css)
    css = re.sub(r'\s*{\s*', '{', css)
    css = re.sub(r'\s*}\s*', '}', css)
    css = re.sub(r'\s*;\s*', ';', css)
    css = re.sub(r'\s*:\s*', ':', css)
    css = re.sub(r';\s*}', '}', css)
    css = re.sub(r':0\w+', ':0', css)
    css = re.sub(r'#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3', r'#\1\2\3', css)
    return css.strip()

def minify_js(js):
    """Минификация JS через uglify-js или встроенными средствами"""
    # Пробуем использовать uglify-js
    try:
        result = subprocess.run(
            ['npx', 'uglifyjs', '--compress', '--mangle'],
            input=js,
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode == 0:
            return result.stdout
    except:
        pass
    
    # Если не получилось, минифицируем сами
    js = re.sub(r'//.*?\n', '\n', js)
    js = re.sub(r'/\*.*?\*/', '', js, flags=re.DOTALL)
    js = re.sub(r'\s+', ' ', js)
    js = re.sub(r'\s*([{}();,:])\s*', r'\1', js)
    js = re.sub(r'}\s*', '}', js)
    return js.strip()

def minify_html(html):
    """Минификация HTML"""
    html = re.sub(r'<!--.*?-->', '', html, flags=re.DOTALL)
    html = re.sub(r'\n\s*', '', html)
    html = re.sub(r'>\s+<', '><', html)
    html = re.sub(r'\s+', ' ', html)
    return html.strip()

def build_three_files():
    """Сборка в 3 файла"""
    print("📦 Сборка в 3 файла...")
    
    # Читаем все JS файлы
    js_files = [
        'js/config.js',
        'js/map.js',
        'js/pacman.js',
        'js/ghosts.js',
        'js/renderer.js',
        'js/game.js',
        'js/main.js'
    ]
    
    combined_js = ''
    for file in js_files:
        if os.path.exists(file):
            combined_js += read_file(file) + '\n'
            print(f"  ✅ {file}")
        else:
            print(f"  ❌ {file} не найден!")
    
    # Читаем CSS
    css = read_file('css/style.css')
    print(f"  ✅ css/style.css")
    
    # Минифицируем
    print("🎨 Минификация...")
    minified_css = minify_css(css)
    minified_js = minify_js(combined_js)
    
    # Читаем HTML и заменяем ссылки
    html = read_file('index.html')
    html = html.replace(
        '<link rel="stylesheet" href="css/style.css">',
        f'<link rel="stylesheet" href="style.css">'
    )
    # Удаляем отдельные script теги, оставляем один на game.js
    html = re.sub(r'<script src="js/.*?"></script>\s*', '', html)
    html = html.replace('</body>', '<script src="game.js"></script>\n</body>')
    
    # Сохраняем
    write_file('dist/style.css', minified_css)
    write_file('dist/game.js', minified_js)
    write_file('dist/index.html', html)
    
    # Размеры
    css_size = len(minified_css)
    js_size = len(minified_js)
    html_size = len(html)
    total = css_size + js_size + html_size
    
    print(f"\n✅ Собрано в dist/:")
    print(f"  📄 index.html: {html_size} байт")
    print(f"  🎨 style.css: {css_size} байт")
    print(f"  📦 game.js: {js_size} байт")
    print(f"  📊 Всего: {total} байт")

def build_single_file():
    """Сборка в 1 HTML файл"""
    print("📦 Сборка в 1 файл...")
    
    # Читаем все JS файлы
    js_files = [
        'js/config.js',
        'js/map.js',
        'js/pacman.js',
        'js/ghosts.js',
        'js/renderer.js',
        'js/game.js',
        'js/main.js'
    ]
    
    combined_js = ''
    for file in js_files:
        if os.path.exists(file):
            combined_js += read_file(file) + '\n'
            print(f"  ✅ {file}")
        else:
            print(f"  ❌ {file} не найден!")
    
    # Читаем CSS
    css = read_file('css/style.css')
    print(f"  ✅ css/style.css")
    
    # Читаем HTML
    html = read_file('index.html')
    print(f"  ✅ index.html")
    
    # Минифицируем
    print("🎨 Минификация...")
    minified_css = minify_css(css)
    minified_js = minify_js(combined_js)
    
    # Встраиваем CSS и JS в HTML
    html = html.replace(
        '<link rel="stylesheet" href="css/style.css">',
        f'<style>{minified_css}</style>'
    )
    
    # Удаляем все script теги
    html = re.sub(r'<script src="js/.*?"></script>\s*', '', html)
    
    # Вставляем JS перед закрывающим body
    html = html.replace('</body>', f'<script>{minified_js}</script>\n</body>')
    
    # Минифицируем HTML
    minified_html = minify_html(html)
    
    # Сохраняем
    write_file('index_bundle.html', '<!DOCTYPE html>' + minified_html)
    
    bundle_size = os.path.getsize('index_bundle.html')
    print(f"\n✅ Собрано в index_bundle.html: {bundle_size} байт")

def build_template():
    """Сборка в Jinja2 шаблон"""
    print("📦 Сборка в Jinja2 шаблон...")
    
    # Читаем все JS файлы
    js_files = [
        'js/config.js',
        'js/map.js',
        'js/pacman.js',
        'js/ghosts.js',
        'js/renderer.js',
        'js/game.js',
        'js/main.js'
    ]
    
    combined_js = ''
    for file in js_files:
        if os.path.exists(file):
            combined_js += read_file(file) + '\n'
            print(f"  ✅ {file}")
        else:
            print(f"  ❌ {file} не найден!")
    
    # Читаем CSS
    css = read_file('css/style.css')
    print(f"  ✅ css/style.css")
    
    # Читаем HTML
    html = read_file('index.html')
    print(f"  ✅ index.html")
    
    # Минифицируем
    print("🎨 Минификация...")
    minified_css = minify_css(css)
    # НЕ минифицируем JS для шаблона, чтобы избежать проблем с Jinja2
    # Просто объединяем файлы
    combined_js = combined_js.strip()
    
    # Экранируем проблемные символы для Jinja2
    # Заменяем { на {{ "{" }} и } на {{ "}" }} в JS коде
    # Но лучше использовать raw блок
    
    # Создаем Jinja2 шаблон с raw блоком для JS
    template = """{% extends "base.html" %}

{% block title %}👻 Pac-Man — Классическая игра{% endblock %}

{% block extra_head %}
<style>CUSTOM_CSS</style>
{% endblock %}

{% block content %}
<div class="game-wrapper">
    <h1>👻 Pac-Man</h1>
    
    <div class="game-container">
        <canvas id="gameCanvas"></canvas>
        
        <div class="stats-row">
            <div class="stat">🏆 Счёт: <span id="scoreValue">0</span></div>
            <div class="stat">❤️ Жизни: <span id="livesValue">3</span></div>
            <div class="stat">🎯 Уровень: <span id="levelValue">1</span></div>
        </div>
        
        <div class="game-buttons">
            <button class="restart-btn" onclick="restartGame()">🔄 Заново</button>
            <button class="pause-btn" id="pauseBtn" onclick="togglePause()">⏸️ Пауза</button>
        </div>
        
        <!-- Мобильные кнопки управления -->
        <div class="mobile-controls">
            <div class="control-row">
                <button class="control-btn" id="btnUp">▲</button>
            </div>
            <div class="control-row">
                <button class="control-btn" id="btnLeft">◀</button>
                <button class="control-btn" id="btnDown">▼</button>
                <button class="control-btn" id="btnRight">▶</button>
            </div>
        </div>
        
        <p class="controls-hint">💡 Стрелки/WASD — движение | Пробел — пауза</p>
    </div>
    
    <a href="/projects" class="back-link">← Назад к проектам</a>
</div>
{% endblock %}

{% block extra_scripts %}
{% raw %}
<script>CUSTOM_JS</script>
{% endraw %}
{% endblock %}"""
    
    # Вставляем CSS и JS
    template = template.replace('CUSTOM_CSS', minified_css)
    template = template.replace('CUSTOM_JS', combined_js)
    
    # Сохраняем
    output_file = 'pacman_template_bundle.html'
    write_file(output_file, template)
    
    template_size = os.path.getsize(output_file)
    print(f"\n✅ Собрано в {output_file}: {template_size} байт")
    print(f"📋 Шаблон готов для FastAPI!")
    print(f"💡 Использование в роутере:")
    print(f"   return templates.TemplateResponse('projects/pacman_template_bundle.html', {{'request': request}})")
def show_help():
    print("""
🔧 Сборщик Pac-Man игры

Использование:
  python build.py          - сборка в 3 файла (dist/)
  python build.py single   - сборка в 1 файл (index_bundle.html)
  python build.py template - сборка в Jinja2 шаблон (pacman_template_bundle.html)
  python build.py all      - все варианты сборки
  python build.py help     - показать справку
""")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        build_three_files()
    elif sys.argv[1] == 'single':
        build_single_file()
    elif sys.argv[1] == 'template':
        build_template()
    elif sys.argv[1] == 'all':
        build_three_files()
        print("\n" + "="*50 + "\n")
        build_single_file()
        print("\n" + "="*50 + "\n")
        build_template()
    elif sys.argv[1] == 'help':
        show_help()
    else:
        show_help()