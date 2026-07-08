#!/usr/bin/env python3
"""
Сборщик Space Invaders игры.
Собирает все JS и CSS файлы.
Режимы:
  python build.py          - сборка в 3 файла (dist/)
  python build.py single   - сборка в 1 файл (index_bundle.html)
  python build.py template - сборка в Jinja2 шаблон
  python build.py all      - все варианты
"""

import re
import os
import sys
import subprocess

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    dir_name = os.path.dirname(path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def minify_css(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)
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
    try:
        result = subprocess.run(
            ['npx', 'uglifyjs', '--compress', '--mangle'],
            input=js, capture_output=True, text=True, timeout=30
        )
        if result.returncode == 0:
            return result.stdout
    except:
        pass
    
    js = re.sub(r'//.*?\n', '\n', js)
    js = re.sub(r'/\*.*?\*/', '', js, flags=re.DOTALL)
    js = re.sub(r'\s+', ' ', js)
    js = re.sub(r'\s*([{}();,:])\s*', r'\1', js)
    js = re.sub(r'}\s*', '}', js)
    return js.strip()

def minify_html(html):
    html = re.sub(r'<!--.*?-->', '', html, flags=re.DOTALL)
    html = re.sub(r'\n\s*', '', html)
    html = re.sub(r'>\s+<', '><', html)
    html = re.sub(r'\s+', ' ', html)
    return html.strip()

def get_combined_js():
    js_files = [
        'js/config.js',
        'js/player.js',
        'js/aliens.js',
        'js/bullets.js',
        'js/renderer.js',
        'js/game.js',
        'js/main.js'
    ]
    
    combined = ''
    for file in js_files:
        if os.path.exists(file):
            combined += read_file(file) + '\n'
            print(f"  ✅ {file}")
        else:
            print(f"  ❌ {file} не найден!")
    
    return combined

def build_three_files():
    print("📦 Сборка в 3 файла...")
    
    combined_js = get_combined_js()
    css = read_file('css/style.css')
    print(f"  ✅ css/style.css")
    
    print("🎨 Минификация...")
    minified_css = minify_css(css)
    minified_js = minify_js(combined_js)
    
    html = """<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>👾 Space Invaders</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="game-wrapper">
        <h1>👾 Space Invaders</h1>
        <div class="highscore-bar">🏆 Рекорд: <span id="highscoreValue">0</span></div>
        <div class="game-container">
            <canvas id="gameCanvas"></canvas>
            <div class="stats-row">
                <div class="stat">🔫 Счёт: <span id="scoreValue">0</span></div>
                <div class="stat">❤️ Жизни: <span id="livesValue">3</span></div>
                <div class="stat">👾 Врагов: <span id="enemiesValue">0</span></div>
            </div>
            <div class="game-buttons">
                <button class="restart-btn" onclick="restartGame()">🔄 Заново</button>
                <button class="pause-btn" id="pauseBtn" onclick="togglePause()">⏸️ Пауза</button>
            </div>
            <div class="mobile-controls">
                <div class="control-row">
                    <button class="control-btn control-btn-wide" id="btnFire">🔫 ОГОНЬ</button>
                </div>
                <div class="control-row">
                    <button class="control-btn" id="btnLeft">◀</button>
                    <button class="control-btn" id="btnRight">▶</button>
                </div>
            </div>
            <p class="controls-hint">💡 Стрелки — движение | Пробел — стрельба</p>
        </div>
    </div>
    <script src="game.js"></script>
</body>
</html>"""
    
    write_file('dist/style.css', minified_css)
    write_file('dist/game.js', minified_js)
    write_file('dist/index.html', html)
    
    print(f"\n✅ Собрано в dist/: {len(minified_css) + len(minified_js) + len(html)} байт")

def build_single_file():
    print("📦 Сборка в 1 файл...")
    
    combined_js = get_combined_js()
    css = read_file('css/style.css')
    html = read_file('index.html')
    
    print("🎨 Минификация...")
    minified_css = minify_css(css)
    minified_js = minify_js(combined_js)
    
    html = html.replace(
        '<link rel="stylesheet" href="css/style.css">',
        f'<style>{minified_css}</style>'
    )
    html = re.sub(r'<script src="js/.*?"></script>\s*', '', html)
    html = html.replace('</body>', f'<script>{minified_js}</script>\n</body>')
    
    minified_html = minify_html(html)
    write_file('index_bundle.html', '<!DOCTYPE html>' + minified_html)
    
    print(f"\n✅ Собрано в index_bundle.html: {os.path.getsize('index_bundle.html')} байт")

def build_template():
    print("📦 Сборка в Jinja2 шаблон...")
    
    combined_js = get_combined_js()
    css = read_file('css/style.css')
    
    print("🎨 Минификация...")
    minified_css = minify_css(css)
    combined_js = combined_js.strip()
    
    template = """{% extends "base.html" %}

{% block title %}👾 Space Invaders — Классическая аркада{% endblock %}

{% block extra_head %}
<style>CUSTOM_CSS</style>
{% endblock %}

{% block content %}
<div class="game-wrapper">
    <h1>👾 Space Invaders</h1>
    <div class="highscore-bar">🏆 Рекорд: <span id="highscoreValue">0</span></div>
    
    <div class="game-container">
        <canvas id="gameCanvas"></canvas>
        
        <div class="stats-row">
            <div class="stat">🔫 Счёт: <span id="scoreValue">0</span></div>
            <div class="stat">❤️ Жизни: <span id="livesValue">3</span></div>
            <div class="stat">👾 Врагов: <span id="enemiesValue">0</span></div>
        </div>
        
        <div class="game-buttons">
            <button class="restart-btn" onclick="restartGame()">🔄 Заново</button>
            <button class="pause-btn" id="pauseBtn" onclick="togglePause()">⏸️ Пауза</button>
        </div>
        
        <div class="mobile-controls">
            <div class="control-row">
                <button class="control-btn control-btn-wide" id="btnFire">🔫 ОГОНЬ</button>
            </div>
            <div class="control-row">
                <button class="control-btn" id="btnLeft">◀</button>
                <button class="control-btn" id="btnRight">▶</button>
            </div>
        </div>
        
        <p class="controls-hint">💡 Стрелки — движение | Пробел — стрельба</p>
    </div>
    
    <a href="/projects" class="back-link">← Назад к проектам</a>
</div>
{% endblock %}

{% block extra_scripts %}
<script>CUSTOM_JS</script>
{% endblock %}"""
    
    template = template.replace('CUSTOM_CSS', minified_css)
    template = template.replace('CUSTOM_JS', combined_js)
    
    write_file('space_invaders_template_bundle.html', template)
    print(f"\n✅ Собрано в space_invaders_template_bundle.html")

def show_help():
    print("""
🔧 Сборщик Space Invaders

Использование:
  python build.py          - сборка в 3 файла (dist/)
  python build.py single   - сборка в 1 файл (index_bundle.html)
  python build.py template - сборка в Jinja2 шаблон
  python build.py all      - все варианты
  python build.py help     - справка
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