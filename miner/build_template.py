#!/usr/bin/env python3
"""Сборка шаблона игры с встраиванием CSS и JS"""
import re
import os

print("🔧 Сборка шаблона Minesweeper...")

# Читаем исходные файлы
with open('minesweeper_template.html', 'r', encoding='utf-8') as f:
    template = f.read()

with open('minesweeper.css', 'r', encoding='utf-8') as f:
    css = f.read()

with open('minesweeper.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Минификация CSS
print("🎨 Минификация CSS...")
css = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)
css = re.sub(r'\s+', ' ', css)
css = re.sub(r'\s*{\s*', '{', css)
css = re.sub(r'\s*}\s*', '}', css)
css = re.sub(r'\s*;\s*', ';', css)
css = re.sub(r'\s*:\s*', ':', css)
css = re.sub(r';\s*}', '}', css)
css = re.sub(r':0\w+', ':0', css)
css = re.sub(r'#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3', r'#\1\2\3', css)

# Минификация JS (простая, без uglify-js для независимости)
print("📦 Минификация JS...")
# Удаляем комментарии
js = re.sub(r'//.*?\n', '\n', js)
js = re.sub(r'/\*.*?\*/', '', js, flags=re.DOTALL)
# Удаляем лишние пробелы и переносы строк
js = re.sub(r'\s+', ' ', js)
js = re.sub(r'\s*([{}();,:])\s*', r'\1', js)
js = re.sub(r'}\s*', '}', js)
# Убираем пробелы вокруг операторов, но сохраняем читаемость
js = re.sub(r'\s*([=<>!+\-*/%&|^])\s*', r'\1', js)
js = re.sub(r';\s*}', '}', js)
js = js.strip()

# Встраиваем CSS и JS в шаблон
print("📄 Обработка шаблона...")

# Заменяем внешний CSS на встроенный
template = re.sub(
    r'{%\s*block\s+extra_head\s*%}.*?{%\s*endblock\s*%}',
    f'{{% block extra_head %}}\n<style>{css}</style>\n{{% endblock %}}',
    template,
    flags=re.DOTALL
)

# Заменяем внешний JS на встроенный
template = re.sub(
    r'{%\s*block\s+extra_scripts\s*%}.*?{%\s*endblock\s*%}',
    f'{{% block extra_scripts %}}\n<script>{js}</script>\n{{% endblock %}}',
    template,
    flags=re.DOTALL
)

# Дополнительная минификация HTML в шаблоне
template = re.sub(r'<!--.*?-->', '', template, flags=re.DOTALL)
# Сохраняем структуру шаблона, минимизируя пробелы между тегами
template = re.sub(r'>\s+<', '><', template)
# Убираем множественные пробелы
template = re.sub(r'\s{2,}', ' ', template)
# Убираем пробелы в начале и конце строк
template = '\n'.join(line.strip() for line in template.split('\n') if line.strip())

# Сохраняем результат
output_file = 'minesweeper_template_bundle.html'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(template)

# Считаем размеры
original_size = (
    os.path.getsize('minesweeper_template.html') + 
    os.path.getsize('minesweeper.css') + 
    os.path.getsize('minesweeper.js')
)
bundle_size = os.path.getsize(output_file)

print(f"\n✅ Готово!")
print(f"📊 Исходные файлы: {original_size} байт")
print(f"🚀 Бандл шаблона: {bundle_size} байт")
print(f"💪 Экономия: {((original_size - bundle_size) / original_size * 100):.1f}%")
print(f"📁 Файл: {output_file}")