# Тестовое задание RoboMarkets

<details>
  <summary>Текст задания</summary>
  Дано. 
  
  БД со следующей структурой и данными.

```sql
# DROP TABLE IF EXISTS `account`;

CREATE TABLE `account` (
`login` bigint(20) unsigned NOT NULL COMMENT 'account',
`source` int(10) unsigned NOT NULL,
`balance_usd` double DEFAULT '0' COMMENT 'account balance',
`balance_usd_sub` double DEFAULT '0' COMMENT 'subscription network balance',
PRIMARY KEY (`source`, `login`)
) ENGINE=InnoDB;

INSERT INTO `account` VALUES
('60000000000060839', '203', '20', '0'),
('60000000000060840', '203', '10', '0'),
('60000000000061841', '203', '20', '0'),
('60000000000062842', '203', '30', '0'),
('60000000000063843', '203', '40', '0'),
('60000000000064844', '203', '50', '0'),
('60000000000065845', '203', '60', '0'),
('60000000000066847', '203', '70', '0'),
('60000000000067850', '203', '80', '0'),
('60000000000068851', '203', '90', '0'),
('60000000000069853', '203', '80', '0'),
('60000000000070854', '203', '70', '0'),
('60000000000071855', '203', '60', '0'),
('60000000000072854', '203', '50', '0'),
('60000000000073855', '203', '40', '0');

# DROP TABLE IF EXISTS `subscription`;

CREATE TABLE `subscription` (
`login` bigint(20) unsigned NOT NULL COMMENT 'trader account',
`source` int(10) unsigned NOT NULL COMMENT 'trader source',
`r_login` bigint(20) unsigned NOT NULL COMMENT 'investor account',
`r_source` int(10) unsigned NOT NULL COMMENT 'investor source',
PRIMARY KEY (`source`,`login`,`r_source`,`r_login`),
KEY `r_idx` (`r_source`,`r_login`,`source`,`login`)
) ENGINE=InnoDB;

INSERT INTO `subscription` VALUES

# 1й треугольник

('60000000000060839', '203', '60000000000060840', '203'),
('60000000000060840', '203', '60000000000061841', '203'),
('60000000000061841', '203', '60000000000060839', '203'),

# 2й треугольник

('60000000000062842', '203', '60000000000063843', '203'),
('60000000000062842', '203', '60000000000064844', '203'),
('60000000000064844', '203', '60000000000063843', '203'),

# ромб

('60000000000064844', '203', '60000000000065845', '203'),
('60000000000064844', '203', '60000000000066847', '203'),
('60000000000065845', '203', '60000000000067850', '203'),
('60000000000066847', '203', '60000000000067850', '203'),

# узлы 2го треугольника

('60000000000063843', '203', '60000000000068851', '203'),
('60000000000063843', '203', '60000000000069853', '203'),

# узлы ромба

('60000000000067850', '203', '60000000000070854', '203'),
('60000000000067850', '203', '60000000000071855', '203');

```

Задание.

Реализовать nodejs сервис, предоставляющий следующий HTTP API для работы с данными БД.

Произвести первоначальный рассчет балансов подписок (баланс сети подписок).
Баланс сети подписок (subscription network balance) для провайдера - это сумма собственного баланса провайдера и балансов всех аккаунтов, подписанных на него как непосредственно, так и через другие аккаунты на всех уровнях.

Любой счет не может входить в сеть подписок более одного раза.

GET /rating
Выдача счетов, отсортированных по балансу подписок + количество подписчиков сети result = [ { source, login, balance_usd, balance_usd_sub, subscribers_count } ]

POST /subscribe
Cоздание подписки, добавляет запись в `subscription` + приводит к пересчету баланса сети
payload = { login, source, r_login, r_sorce }

POST /unsubscribe
Удаление подписки, удаляет строку из `subscription` + приводит к пересчету баланса сети
payload = { login, source, r_login, r_sorce }

Дополнительные задания (не обязательно, будет являться плюсом)

- При создании и удалении подписок, пересчитывать балансы сети аккаунтов, затронутых этим изменением (балансы в затронутой части сети подписок).
- Спроектировать и реализовать API метод изменения баланса счета, приводящий к пересчету баланса сети.

Пояснения:

- Язык: javascript nodejs + возможны модули для работы с СУБД и HTTP
- СУБД: Предпочтительно MYSQL
- Для выполнения задания можно использовать любые средства SQL, PLSQL и тд
- Возможно расширение структуры таблиц (добавление полей, индексов и тд)
- Возможно добавление новых таблиц
- Возможно привлечение любых средств и технологий, целесообразность применения которых мы будем обсуждать на собеседовании
</details>

## Допущения

- Балансы переведены из double в int дабы избежать проблем с неточностью вычислений.
- Payload методов /subscribe, /unsubscribe изменён:
  1. login приходит в заголовке после расшифровки JWT токена
  2. source, r_source берутся из таблицы с аккаунтами

## Основные предположения

- Сервис должен быть легко масштабируем
- Сервис должен быть готов к высоким нагрузкам

## Решения

- Не связывать между собой таблицы запросами. Все запросы к бд максимально простые
- Разделить базы на master-slave для снятия нагрузки с master базы при запросах на чтение информации о подписках
- Выделить отдельно воркеры для выполнения операций, результат которых не важен при обращении пользователя
- Выделить отдельный воркер, обрабатывающий входящие бизнес события системы

## Запуск в docker

1. Порты 80, 8082 должны быть свободны
2. Инициализация баз данных (нужно дождаться пока закончится, потом Ctrl+C)

```bash
./init-db
```

3. Заполнение базы данными

```bash
./fill-db
```

4. Запуск сервисов

```bash
./run-dev
```

## Проекты

- api-gw
- auth
- subscriptions

Описание каждого проекта в собственном readme.md

## Примеры запросов

<details>
  <summary>Топ счетов</summary>

```bash
curl --location --request GET '127.0.0.1/v1/rating'
```

</details>

<details>
  <summary>Подписка</summary>
  
  ```bash
  curl --location --request POST '127.0.0.1/v1/subscribe' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MDAwMDAwMDAwMDA2NDg0NCIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTUxNjIzOTAyMn0.-UDpdJV27oQ5GnikTMSfPMyna8WcOpcAao4xji1yVQU' \
  --header 'Content-Type: application/json' \
  --data-raw '{
      "subscribe_to": "60000000000060839"
  }'
  ```
</details>
<details>
  <summary>Отписка</summary>
  
  ```bash
  curl --location --request POST '127.0.0.1/v1/unsubscribe' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MDAwMDAwMDAwMDA2NDg0NCIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTUxNjIzOTAyMn0.-UDpdJV27oQ5GnikTMSfPMyna8WcOpcAao4xji1yVQU' \
  --header 'Content-Type: application/json' \
  --data-raw '{
      "unsubscribe_from": "60000000000060839"
  }'
  ```
</details>
<details>
  <summary>Обновление всех подписок</summary>
  
- Метод не публичный (не доступен через api-gw), можно вызывать только напрямую через сервис

```bash
curl --location --request POST '127.0.0.1:8082/v1/refresh-all'
```

</details>
<details>
  <summary>Пересчёт подписок пользователя</summary>

```bash
curl --location --request POST '127.0.0.1/v1/refresh' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MDAwMDAwMDAwMDA2NDg0NCIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTUxNjIzOTAyMn0.-UDpdJV27oQ5GnikTMSfPMyna8WcOpcAao4xji1yVQU'
```

</details>
<details>
  <summary>Изменение баланса пользователя</summary>

- Параметр correlation должен быть уникальным для каждого запроса в рамках одной минуты
- Метод не публичный (не доступен через api-gw), потому вызывается напрямую через сервис

```bash
curl --location --request POST '127.0.0.1:8082/v1/change-balance' \
--header 'Content-Type: application/json' \
--data-raw '{
    "correlation": "d7831e33-d651-4fb9-84b4-9997cab677b1",
    "login": "60000000000061841",
    "balance_diff": -1000
}'
```

</details>
