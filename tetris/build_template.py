#!/usr/bin/env python3
"""Сборка шаблона Tetris с встраиванием CSS и JS"""
import re
import os

print("🔧 Сборка шаблона Tetris...")

with open('tetris_template.html', 'r', encoding='utf-8') as f:
    template = f.read()

with open('tetris.css', 'r', encoding='utf-8') as f:
    css = f.read()

with open('tetris.js', 'r', encoding='utf-8') as f:
    js = f.read()

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

print("📦 Минификация JS...")
js = re.sub(r'//.*?\n', '\n', js)
js = re.sub(r'/\*.*?\*/', '', js, flags=re.DOTALL)
js = re.sub(r'\s+', ' ', js)
js = re.sub(r'\s*([{}();,:])\s*', r'\1', js)
js = re.sub(r'}\s*', '}', js)
js = re.sub(r'\s*([=<>!+\-*/%&|^])\s*', r'\1', js)
js = js.strip()

print("📄 Обработка шаблона...")
template = re.sub(
    r'{%\s*block\s+extra_head\s*%}.*?{%\s*endblock\s*%}',
    f'{{% block extra_head %}}\n<style>{css}</style>\n{{% endblock %}}',
    template,
    flags=re.DOTALL
)

template = re.sub(
    r'{%\s*block\s+extra_scripts\s*%}.*?{%\s*endblock\s*%}',
    f'{{% block extra_scripts %}}\n<script>{js}</script>\n{{% endblock %}}',
    template,
    flags=re.DOTALL
)

template = re.sub(r'<!--.*?-->', '', template, flags=re.DOTALL)
template = re.sub(r'>\s+<', '><', template)
template = re.sub(r'\s{2,}', ' ', template)
template = '\n'.join(line.strip() for line in template.split('\n') if line.strip())

with open('tetris_template_bundle.html', 'w', encoding='utf-8') as f:
    f.write(template)

original_size = os.path.getsize('tetris_template.html') + os.path.getsize('tetris.css') + os.path.getsize('tetris.js')
bundle_size = os.path.getsize('tetris_template_bundle.html')

print(f"\n✅ Шаблон Tetris готов!")
print(f"📊 Исходные: {original_size} байт")
print(f"🚀 Шаблон: {bundle_size} байт")
print(f"💪 Экономия: {((original_size - bundle_size) / original_size * 100):.1f}%")