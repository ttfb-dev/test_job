
sm-basket
======

#### Dev-окружение
* Запуск dev-окружения:
```bash
./build/run-dev
```

* Накатить миграции:
```bash
docker exec -ti sm-basket-api sh
./node_modules/.bin/node-pg-migrate up
```
