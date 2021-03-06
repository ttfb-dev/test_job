# subscriptions

## Запуск сервиса

#### Инициализация бд

```bash
./build/init-db
```

#### Заполнение данными бд

```bash
./build/fill-db
```

#### Запуск dev-окружения:

```bash
./build/run-dev
```

## Описание

### Сервисы

- **api**: rest-api
- **webhooks**: воркер, обрабатывающий бизнес-события (при распределённом подходе реализации event-bus), можно заменить на кафку итп
- **worker-remove-subscriptions**: воркер, удаляющий помеченные записи о подписке в часы минимальной нагрузки
- **worker-refresh-account**: воркер, обновляющий помеченные аккаунты
- **mysql-master**: master репликация базы данных
- **mysql-slave**: slave репликация базы данных, созданная для чтения не критичных в актуальности данных

## Документация

http://127.0.0.1:8082/schema
