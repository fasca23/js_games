#!/usr/bin/env python3
"""Полная сборка с оптимизацией"""
import re
import subprocess
import os

print("🔧 Сборка Tetris Game...")

# 1. Оптимизируем JS через uglify-js
print("📦 Оптимизация JS...")
subprocess.run([
    "npx", "uglifyjs", "tetris.js",
    "--compress", "drop_console=true,passes=2",
    "--mangle", "toplevel=true",
    "--mangle-props", "regex=/^_/",
    "--output", "tetris.min.js"
], check=True)

# Читаем минифицированный JS
with open('tetris.min.js') as f:
    js = f.read()

# 2. Минифицируем CSS
print("🎨 Минификация CSS...")
with open('tetris.css') as f:
    css = f.read()

# Удаляем комментарии
css = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)
# Удаляем пробелы
css = re.sub(r'\s+', ' ', css)
css = re.sub(r'\s*{\s*', '{', css)
css = re.sub(r'\s*}\s*', '}', css)
css = re.sub(r'\s*;\s*', ';', css)
css = re.sub(r'\s*:\s*', ':', css)
css = re.sub(r';\s*}', '}', css)
# Удаляем последние точки с запятой перед }
css = re.sub(r';}', '}', css)
# Удаляем единицы измерения для 0
css = re.sub(r':0\w+', ':0', css)
# Сокращаем hex-цвета
css = re.sub(r'#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3', r'#\1\2\3', css)

# 3. Читаем HTML
print("📄 Обработка HTML...")
with open('index.html') as f:
    html = f.read()

# Встраиваем CSS и JS
html = html.replace(
    '<link rel="stylesheet" href="tetris.css">',
    f'<style>{css}</style>'
)
html = html.replace(
    '<script src="tetris.js"></script>',
    f'<script>{js}</script>'
)

# 4. Минифицируем HTML
html = re.sub(r'<!--.*?-->', '', html, flags=re.DOTALL)
html = re.sub(r'\n\s*', '', html)
html = re.sub(r'>\s+<', '><', html)
html = re.sub(r'\s+', ' ', html)

# 5. Сохраняем
with open('index_bundle.html', 'w') as f:
    f.write('<!DOCTYPE html>')
    f.write(html)

# Удаляем временный файл
os.remove('tetris.min.js')

# Считаем размеры
original_size = os.path.getsize('index.html') + os.path.getsize('tetris.css') + os.path.getsize('tetris.js')
bundle_size = os.path.getsize('index_bundle.html')

print(f"\n✅ Готово!")
print(f"📊 Исходные файлы: {original_size} байт")
print(f"🚀 Бандл: {bundle_size} байт")
print(f"💪 Экономия: {((original_size - bundle_size) / original_size * 100):.1f}%")
print(f"📁 Файл: index_bundle.html")