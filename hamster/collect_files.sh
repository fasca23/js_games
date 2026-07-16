#!/bin/bash

# ============================================
# НАСТРОЙКА ИСКЛЮЧЕНИЙ
# ============================================

# Исключаемые папки (каждая с новой строки)
EXCLUDE_DIRS=(
    "node_modules"
    ".git"
    "vendor"
    "dist"
    "build"
    "__pycache__"
    ".venv"
    "venv"
    "env"
    ".idea"
    ".vscode"
    "target"
    "bin"
    "obj"
    "coverage"
    ".next"
    ".nuxt"
    "bower_components"
    "tmp"
    "temp"
    "cache"
    ".cache"
    "logs"
    "docker"
    ".docker"
)

# Исключаемые файлы (по имени или шаблону)
EXCLUDE_FILES=(
    "*.log"
    "*.lock"
    "*.min.js"
    "*.min.css"
    "package-lock.json"
    "yarn.lock"
    "composer.lock"
    "Gemfile.lock"
    "Cargo.lock"
    "*.pyc"
    "*.pyo"
    ".DS_Store"
    "Thumbs.db"
    ".env"
    ".env.local"
    ".env.production"
    "*.map"
    "*.tsbuildinfo"
    "combined_output.txt"
    "collect_files.sh"
    "hamster_template_bundle.html"
    "index_bundle.html"
    "package-lock.json"
)

# Исключаемые расширения файлов
EXCLUDE_EXTENSIONS=(
    "jpg"
    "jpeg"
    "png"
    "gif"
    "bmp"
    "ico"
    "svg"
    "webp"
    "tiff"
    "psd"
    "ai"
    "eps"
    "mp4"
    "avi"
    "mov"
    "mkv"
    "wmv"
    "flv"
    "webm"
    "mp3"
    "wav"
    "flac"
    "ogg"
    "wma"
    "aac"
    "zip"
    "tar"
    "gz"
    "rar"
    "7z"
    "bz2"
    "xz"
    "pdf"
    "doc"
    "docx"
    "xls"
    "xlsx"
    "ppt"
    "pptx"
    "odt"
    "ods"
    "exe"
    "dll"
    "so"
    "dylib"
    "class"
    "jar"
    "war"
    "bin"
    "dat"
    "db"
    "sqlite"
    "mdb"
    "ttf"
    "otf"
    "woff"
    "woff2"
    "eot"
    "iso"
    "img"
    "dmg"
    "pkg"
    "deb"
    "rpm"
)

# ============================================
# НАСТРОЙКА ВЫХОДНОГО ФАЙЛА
# ============================================

OUTPUT_FILE="combined_output.txt"
TEXT_ONLY=true
MAX_FILE_SIZE=10485760  # 10 MB

# ============================================
# ПРЕДВАРИТЕЛЬНАЯ ОЧИСТКА
# ============================================

echo "🧹 Очистка перед началом работы..."
echo "================================"

# Удаляем старый выходной файл если существует
if [ -f "$OUTPUT_FILE" ]; then
    rm -f "$OUTPUT_FILE"
    echo "✅ Удален старый файл: $OUTPUT_FILE"
else
    echo "📄 Файл $OUTPUT_FILE не существует, создаем новый"
fi

# Создаем пустой файл с заголовком
{
    echo "==========================================="
    echo "📄 ОБЪЕДИНЕННЫЙ ФАЙЛ ПРОЕКТА"
    echo "==========================================="
    echo "📅 Дата создания: $(date)"
    echo "📁 Директория: $(pwd)"
    echo "==========================================="
    echo ""
} > "$OUTPUT_FILE"

echo "✅ Создан новый пустой файл: $OUTPUT_FILE"
echo ""

# ============================================
# ОСНОВНОЙ КОД
# ============================================

# Счетчики
file_count=0
skipped_count=0
error_count=0
total_size=0
total_lines=0
source_lines=0

echo "🔍 Начинаю сбор файлов..."
echo "================================"
echo ""

# Функция проверки исключений
should_exclude() {
    local filepath="$1"
    local filename=$(basename "$filepath")
    local extension="${filename##*.}"
    
    # Проверяем исключаемые папки
    for dir in "${EXCLUDE_DIRS[@]}"; do
        if [[ "$filepath" == *"/$dir/"* ]] || [[ "$filepath" == *"/$dir" ]]; then
            return 0
        fi
    done
    
    # Проверяем исключаемые файлы по имени/шаблону
    for pattern in "${EXCLUDE_FILES[@]}"; do
        if [[ "$filename" == $pattern ]]; then
            return 0
        fi
    done
    
    # Проверяем исключаемые расширения
    if [ -n "$extension" ] && [ "$extension" != "$filename" ]; then
        for ext in "${EXCLUDE_EXTENSIONS[@]}"; do
            if [[ "${extension,,}" == "${ext,,}" ]]; then
                return 0
            fi
        done
    fi
    
    return 1
}

# Форматирование размера
format_size() {
    local size=$1
    if [ "$size" -gt 1073741824 ]; then
        echo "$(bc <<< "scale=2; $size/1073741824") GB"
    elif [ "$size" -gt 1048576 ]; then
        echo "$(bc <<< "scale=2; $size/1048576") MB"
    elif [ "$size" -gt 1024 ]; then
        echo "$(bc <<< "scale=2; $size/1024") KB"
    else
        echo "$size bytes"
    fi
}

# Форматирование чисел с разделителями
format_number() {
    local num=$1
    if [ "$num" -gt 999 ]; then
        echo "$(printf "%'d" $num 2>/dev/null || echo $num)"
    else
        echo "$num"
    fi
}

# Строим команду find с исключениями
find_args=("." "-type" "f")

for dir in "${EXCLUDE_DIRS[@]}"; do
    find_args+=("-not" "-path" "*/$dir/*")
done

find_args+=("-not" "-name" "$OUTPUT_FILE")

# Выполняем поиск и обработку
while IFS= read -r -d '' file; do
    # Проверяем исключения
    if should_exclude "$file"; then
        echo "⏭️  Пропускаю (исключение): $file"
        ((skipped_count++))
        continue
    fi
    
    # Проверяем доступность файла
    if [ ! -r "$file" ]; then
        echo "❌ Ошибка доступа: $file"
        ((error_count++))
        continue
    fi
    
    # Получаем размер файла
    if [[ "$OSTYPE" == "darwin"* ]]; then
        file_size=$(stat -f%z "$file" 2>/dev/null || echo 0)
        file_date=$(stat -f "%Sm" "$file" 2>/dev/null || echo "неизвестно")
    else
        file_size=$(stat -c%s "$file" 2>/dev/null || echo 0)
        file_date=$(stat -c "%y" "$file" 2>/dev/null || echo "неизвестно")
    fi
    
    # Проверяем размер
    if [ "$MAX_FILE_SIZE" -gt 0 ] && [ "$file_size" -gt "$MAX_FILE_SIZE" ]; then
        echo "📦 Пропускаю (большой файл): $file ($(format_size $file_size))"
        ((skipped_count++))
        continue
    fi
    
    # Проверяем тип файла
    if [ "$TEXT_ONLY" = true ]; then
        if ! file -b "$file" | grep -qi "text"; then
            echo "📄 Пропускаю (бинарный): $file"
            ((skipped_count++))
            continue
        fi
    fi
    
    # Подсчитываем строки в файле
    file_lines=$(wc -l < "$file" 2>/dev/null || echo 0)
    
    echo "✅ Обрабатываю: $file ($(format_number $file_lines) строк)"
    
    # Записываем информацию о файле
    {
        echo "==========================================="
        echo "📁 Файл: $file"
        echo "📅 Дата: $file_date"
        echo "📏 Размер: $(format_size $file_size)"
        echo "📝 Тип: $(file -b "$file")"
        echo "📊 Строк: $(format_number $file_lines)"
        echo "==========================================="
        echo ""
        cat "$file" 2>/dev/null || {
            echo "❌ Ошибка чтения файла"
            ((error_count++))
        }
        echo ""
        echo ""
    } >> "$OUTPUT_FILE"
    
    ((file_count++))
    total_size=$((total_size + file_size))
    source_lines=$((source_lines + file_lines))
    
done < <(find "${find_args[@]}" -print0 | sort -z)

# Подсчитываем общее количество строк в выходном файле
if [ -f "$OUTPUT_FILE" ]; then
    total_lines=$(wc -l < "$OUTPUT_FILE" 2>/dev/null || echo 0)
fi

# Добавляем финальную статистику в файл
{
    echo "==========================================="
    echo "📊 ИТОГОВАЯ СТАТИСТИКА"
    echo "==========================================="
    echo "✅ Успешно обработано файлов: $(format_number $file_count)"
    echo "⏭️  Пропущено файлов: $(format_number $skipped_count)"
    echo "❌ Ошибок чтения: $(format_number $error_count)"
    echo "📏 Общий размер исходных файлов: $(format_size $total_size)"
    echo "📊 Строк в исходных файлах: $(format_number $source_lines)"
    echo "📄 Строк в итоговом файле: $(format_number $total_lines)"
    echo "📅 Завершено: $(date)"
    echo "==========================================="
} >> "$OUTPUT_FILE"

# Выводим статистику в консоль
echo ""
echo "================================"
echo "📊 ИТОГОВАЯ СТАТИСТИКА"
echo "================================"
echo "✅ Успешно обработано файлов: $(format_number $file_count)"
echo "⏭️  Пропущено файлов: $(format_number $skipped_count)"
echo "❌ Ошибок чтения: $(format_number $error_count)"
echo "📏 Общий размер исходных файлов: $(format_size $total_size)"
echo "📊 Строк в исходных файлах: $(format_number $source_lines)"
echo "📄 Строк в итоговом файле: $(format_number $total_lines)"
echo "📁 Результат сохранен в: $OUTPUT_FILE"
echo "================================"

# Показываем итоговый размер файла
if [ -f "$OUTPUT_FILE" ]; then
    final_size=$(stat -c%s "$OUTPUT_FILE" 2>/dev/null || stat -f%z "$OUTPUT_FILE" 2>/dev/null || echo 0)
    echo "📏 Итоговый размер файла: $(format_size $final_size)"
    
    # Дополнительная информация о файле
    if [ "$source_lines" -gt 0 ] && [ "$total_lines" -gt 0 ]; then
        overhead=$((total_lines - source_lines))
        echo "📊 Служебных строк (заголовки/разделители): $(format_number $overhead)"
        percentage=$(bc <<< "scale=1; ($source_lines * 100) / $total_lines" 2>/dev/null || echo "0")
        echo "📊 Процент полезного содержимого: ${percentage}%"
    fi
    
    echo "================================"
fi