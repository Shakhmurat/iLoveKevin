##### v2.2.1 (gulp+webpack)

# Среда разработки
* **node** ^6.x.x (для упрощения процесса перехода между версиями советую установить **[n](https://www.npmjs.com/package/n)**)
* **npm** ^3.x.x
* **gulp** ^3.x.x (требуется глобальная установка через npm install -g gulp@3)

# Шаги
* Из корня данного проекта запускаем команду `npm install && bower install`, чтобы установить нужные зависимости   

# Команды
## `gulp serve`
Сервирует проект с локалхоста, смотрит в папки _.tmp/_ и _frontend/_. Основной режим разработки.

## `gulp serve:web`
Сервирует собранный проект с локалхоста, смотрит в папку _web/_.

## `gulp`
Дефолтная команда для сборки проекта в режиме markup.

## `gulp build`
Собирает проект в папку _web/_ в режиме markup. Билдит html файлы, копирует папку _pics/_, не собирает админские скрипты и стили.

## `gulp build:prod`
Собирает проект в папку _web/_ в режиме production. Не билдит html файлы, не копирует папку _pics/_, собирает админские скрипты и стили. Использовать эту команду в деплоере.

## `gulp size`
Выдает общий gzip размер папки _web/_. Без учета папки _media/_.

## `gulp size:all`
Выдает общий gzip размер папки _web/_. C учетом папки _media/_.

## `gulp size:detailed`
Выдает gzip размеры папок _styles/_, _scripts/_, _images/_, _fonts/_ и размеры файлов, которые находятся внутри.   



# HTML шаблонизатор **[Nunjucks]

#### Подсветка синтаксиса в Sublime Text для nunjucks - **Jinja2 (HTML)**   
