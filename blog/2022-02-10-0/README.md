---
title: TypeScript - номинальная типизация примитивных типов
description: Как в typescript типизовать Lat/Lng, Rub/Usd/Eur и друге похожие друг на друга типы данных 
url: ts-nominal-type
publishDate: 2022-02-10
---

# TypeScript - номинальная типизация примитивных типов

## Координаты

В моих задачах мне приходится много работать с библиотеками, использующими координаты.
Разные библиотеки могут сохранять/передавать значения координат в разном виде.
Например, это может быть объект с двумя полями или массив с двумя значениями.
С массивом возникают некоторые сложности. В какой последовательности — и почему
именно в такой — должны идти долгота и широта? Каждый автор библиотеки решает
эту проблему по-своему, а нам страдать.

Было бы классно, написать что-то такое:

```ts
type Lat = number;
type Lng = number;

type LatLng = [Lat, Lng];
type LngLat = [Lng, Lat];

```

Но это не сработает, потому что в typescript используется структурная типизация,
и оба типа работают как `[number, number]`. К счастью, номинальную типизацию
можно эмулировать. Для этого к `number` нужно добавить уникальный признак:

```ts
type Lat = number & { __type: 'Lat' };
type Lng = number & { __type: 'Lng' };
```

Теперь типы `Lat` и `Lng` не будут равны друг другу, что нам и нужно было.
Такой подход называется brand/opaque type. И чтобы было удобнее,
можно написать алиас.

```ts
type Brand<T, U> = T & { __type: U };
```

Или взять готовую реализацию из библиотеки с утилитарными типами,
например из [utility-types](https://github.com/piotrwitek/utility-types#brandt-u)
или [type-fest](https://github.com/sindresorhus/type-fest#utilities).

Тогда использование будет выглядеть как-то так:

```ts
type Lat = Brand<number, 'Lat'>;
type Lng = Brand<number, 'Lng'>;

type LatLng = [Lat, Lng];

const lat = 59.57 as Lat;
const lng = 30.19 as Lng;

const fn = (coords: LatLng) => {...};

fn([lat, lng]) // Всё ок

fn([lng, lat]) // Ошибка

```

## Email

Кажется, что с адресом электронной почты можно поступить так же:

```ts
type Email = Brand<string, 'Email'>;
```

Но на самом в typescript 4.1 появились литеральные типы, и они позволяют творить
магию. Например можно написать так:

```ts
type Email = `${string}@${string}.${string}`;
```

Таким образом, можно проверить что тут не случайная строка, а строка в особом
формате, немного похожем на email.

```ts
const notEmail: Email = 'example'; // Ошибка

const email: Email = 'mail@example.com'; // Всё ок
```

Но тут нужно быть осторожным, ибо одно неверное движение — и всё сломается.

```ts
// Ошибки нет, хотя строка не правильного формата
const notEmail = 'example' as Email;
```

## Валюты и немного дженериков

Представим, что приложение работает с разными валютами. И хочется на уровне типов
запретить складывать доллары с рублями без конвертации.

```ts
type Rub = Brand<number, 'Rub'>;
type Usd = Brand<number, 'Usd'>;
type Eur = Brand<number, 'Eur'>;
```

Здесь полностью запретить сложение разных валют не выйдет, но
если всегда для сложения валют использовать функцию — всё будет работать.

```ts
const sumRub = (a: Rub, b: Rub): Rub => {...};
```

В таком случае, нам для каждой валюты придётся писать свои функции.

Но можно использовать дженерики:

```ts
const sum = <T extends>(a: T, b: T): T => ...;

const aRub = 300 as Rub;
const bRub = 600 as Rub;
const cUsd = 30 as Usd;

sum(aRub, bRub) // Всё ок

sum(aRub, cUsd) // Ошибка

```

А теперь используя brand type и литеральные типы, напишем функцию для конвертации
любой валюты в usd.

```ts
const toUsd = <Value extends Brand<number, B>, B extends string>(value: Value, currency: Brand<number, `${Value['__type']}ToUsd`>): Usd => {};

type RubToUsdCurrency = Brand<number, 'RubToUsd'>; 

const rubToUsdCurrency = 30 as RubToUsdCurrency;

toUsd(rub, rubToUsd); // Всё ок
toUsd(eur, rubToUsd); // Ошибка

```

Немного маги. Первый аргумент в дженерике - любой brand type.
Второй аргумент - уникальная строка из brand type.
Такое усложнение нужно, чтобы можно было вытащить эту уникальную строку.
Тип currency можно было бы задать как ```Brand<number, `${B}ToUsd`>```, но тогда
при неправильном вызове функции typescript будет ругаться на первый аргумент.
Если же написать ```Brand<number, `${Value['__type']}ToUsd`>```, то ошибка будет
во втором аргументе, что логичнее.
