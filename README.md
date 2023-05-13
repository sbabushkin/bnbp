# Установка и подготовка к запуску
## Lerna
```
yarn lerna:init
```
## Миграции

### Накатить миграции
- `cd packages/api/src/`
- `yarn db:migrate`
- `yarn db:migrate:logs`
- Холодный запуск backend (если запущен)
## Переменные окружения
### Описание некоторых переменных
- **IN_MEMORY_PUBSUB** - true / false
## Роль
### Проставление администратору всех возможных прав, которые есть
```sql
insert into role_permission (permission_id, role_id)
select p.id, 2
from permission p
left join role_permission rp
on p.id = rp.permission_id
and rp.role_id = 2
where rp.id is null;
```

# Запуск
### Api

для корректной работы всех модулей апи необходимо запустить дополнительные сервисы:

```bash
 cd env && docker-compose up
```

запуск апи:

```bash
 cd packages/api
```
```bash
 yarn start:dev
```
### Web
```bash
 cd packages/web
```
```bash
 yarn start:dev
```
# Миграции
### Создать миграцию
- `cd `
- ` knex migrate:make migration_name`

Создастся файл в папке _migrations_

- `cd packages/api/src/`
- `yarn db:migrate`
