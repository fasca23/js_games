#!/usr/bin/env python3
"""Сборка шаблона Snake с встраиванием CSS и JS"""
import re
import os

print("🔧 Сборка шаблона Snake...")

with open('snake_template.html', 'r', encoding='utf-8') as f:
    template = f.read()

with open('snake.css', 'r', encoding='utf-8') as f:
    css = f.read()

with open('snake.js', 'r', encoding='utf-8') as f:
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
css = css.strip()

# Минификация JS
print("📦 Минификация JS...")
js = re.sub(r'//.*?\n', '\n', js)
js = re.sub(r'/\*.*?\*/', '', js, flags=re.DOTALL)
js = re.sub(r'\s+', ' ', js)
js = re.sub(r'\s*([{}();,:])\s*', r'\1', js)
js = re.sub(r'}\s*', '}', js)
js = re.sub(r'\s*([=<>!+\-*/%&|^])\s*', r'\1', js)
js = js.strip()

# Встраиваем CSS и JS в шаблон
print("📄 Обработка шаблона...")

template = re.sub(
    r'{%\s*block\s+extra_head\s*%}.*?{%\s*endblock\s*%}',
    f'{{% block extra_head %}}<style>{css}</style>{{% endblock %}}',
    template,
    flags=re.DOTALL
)

template = re.sub(
    r'{%\s*block\s+extra_scripts\s*%}.*?{%\s*endblock\s*%}',
    f'{{% block extra_scripts %}}<script>{js}</script>{{% endblock %}}',
    template,
    flags=re.DOTALL
)

# Удаляем HTML комментарии
template = re.sub(r'<!--.*?-->', '', template, flags=re.DOTALL)

# ДОЖИМАЕМ ВСЁ В ОДНУ СТРОКУ
# Убираем пробелы между тегами
template = re.sub(r'>\s+<', '><', template)
# Все пробельные символы (пробелы, табы, переносы) заменяем на один пробел
template = re.sub(r'\s+', ' ', template)
# Убираем пробелы в начале и конце
template = template.strip()

with open('snake.html', 'w', encoding='utf-8') as f:
    f.write(template)

original_size = os.path.getsize('snake_template.html') + os.path.getsize('snake.css') + os.path.getsize('snake.js')
bundle_size = os.path.getsize('snake.html')

print(f"\n✅ Шаблон Snake готов!")
print(f"📊 Исходные: {original_size} байт")
print(f"🚀 Шаблон: {bundle_size} байт")
print(f"💪 Экономия: {((original_size - bundle_size) / original_size * 100):.1f}%")
print(f"📁 Сохранён в snake.html")