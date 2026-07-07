#!/usr/bin/env python3
"""Полная сборка с оптимизацией"""
import re
import subprocess
import os

print("🔧 Сборка Pac-Man Game...")

# 1. Оптимизируем JS через uglify-js
print("📦 Оптимизация JS...")
subprocess.run([
    "npx", "uglifyjs", "pacman.js",
    "--compress", "drop_console=true,passes=2",
    "--mangle", "toplevel=true",
    "--output", "pacman.min.js"
], check=True)

# Читаем минифицированный JS
with open('pacman.min.js') as f:
    js = f.read()

# 2. Минифицируем CSS
print("🎨 Минификация CSS...")
with open('pacman.css') as f:
    css = f.read()

css = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)
css = re.sub(r'\s+', ' ', css)
css = re.sub(r'\s*{\s*', '{', css)
css = re.sub(r'\s*}\s*', '}', css)
css = re.sub(r'\s*;\s*', ';', css)
css = re.sub(r'\s*:\s*', ':', css)
css = re.sub(r';\s*}', '}', css)
css = re.sub(r':0\w+', ':0', css)
css = re.sub(r'#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3', r'#\1\2\3', css)

# 3. Читаем HTML
print("📄 Обработка HTML...")
with open('index.html') as f:
    html = f.read()

# Встраиваем CSS и JS
html = html.replace(
    '<link rel="stylesheet" href="pacman.css">',
    f'<style>{css}</style>'
)
html = html.replace(
    '<script src="pacman.js"></script>',
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
os.remove('pacman.min.js')

# Считаем размеры
original_size = os.path.getsize('index.html') + os.path.getsize('pacman.css') + os.path.getsize('pacman.js')
bundle_size = os.path.getsize('index_bundle.html')

print(f"\n✅ Готово!")
print(f"📊 Исходные файлы: {original_size} байт")
print(f"🚀 Бандл: {bundle_size} байт")
print(f"💪 Экономия: {((original_size - bundle_size) / original_size * 100):.1f}%")
print(f"📁 Файл: index_bundle.html")