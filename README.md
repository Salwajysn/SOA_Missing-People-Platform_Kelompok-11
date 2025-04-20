# Missing People Platform : 'FINDER'

## Kelompok 11:
1. Riyan Suseno - 2310511051
2. Bagus Tri Handoko - 2210511025
3. Salwa Nafisa - 2210511051

### Referensi Website
https://www.scotland.police.uk/what-s-happening/missing-persons/

## 1. Installation
1. Clone Repository
    ```
    npm install
    ```
2. Masuk ke Direkori
   ```
   cd SOA_Missing-People-Platform_Kelompok-11
   ```
3. Install Dependensi
   ```
   npm install
   ```
4. Jalankan MySQL dan Redis
5. Jalankan Backend
   ```
   npm run api
   ```
6. Jalankan Live Server
## 2. Features
### 2.a API CRUD
* Users

|No.|Method|Endpoint|Deskripsi                         |
|---|------|--------|----------------------------------|
|1. |GET   |/users/       |Mengambil semua data di tabel user |
|2. |GET   |/users/:id    |Mengambil data user berdasarkan id|
|3. |PUT   |/users/me    |Mengedit data user berdasarkan id|
|4. |POST   |/users/    |Menginputkan User baru ke tabel user|

* Claims

|No.|Method|Endpoint|Deskripsi                         |
|---|------|--------|----------------------------------|
|1. |GET   |/claims/       |Mengambil semua data di tabel Claims |
|2. |GET   |/claims/:id    |Mengambil data claims berdasarkan id|
|3. |POST   |/claims/    |Menginputkan data baru ke tabel claims|
|4. |PUT   |/claims/:id    |Mengedit data claims berdasarkan id|
|5. |DELETE   |/claims/:id    |Menghapus data claims berdasarkan id|
|6. |GET   |/claims/logs/:id    |Mengambil data claims berdasarkan user id|

* Report

|No.|Method|Endpoint|Deskripsi                         |
|---|------|--------|----------------------------------|
|1. |GET   |/reports/       |Mengambil semua data di tabel Reports |
|2. |GET   |/reports/:id    |Mengambil data reports berdasarkan id|
|3. |POST   |/reports/    |Menginputkan data baru ke tabel reports|
|4. |PUT   |/reports/:id    |Mengedit data reports berdasarkan id|
|5. |DELETE   |/reports/:id    |Menghapus data reports berdasarkan id|
|6. |GET   |/reports/logs/:id    |Mengambil data reports berdasarkan user id|

* Missing Persons

|No.|Method|Endpoint|Deskripsi                         |
|---|------|--------|----------------------------------|
|1. |GET   |/missing-persons/       |Mengambil semua data di tabel missing persons |
|2. |GET   |/missing-persons/:id    |Mengambil data missing persons berdasarkan id|
|3. |POST   |/missing-persons/    |Menginputkan data baru ke tabel missing persons|
|4. |PUT   |/missing-persons/:id    |Mengedit data missing persons berdasarkan id|
|5. |DELETE   |/missing-persons/:id    |Menghapus data missing persons berdasarkan id|
|6. |GET   |/missing-persons/logs/:id    |Mengambil data missing persons berdasarkan user id|
  
* Found Persons

|No.|Method|Endpoint|Deskripsi                         |
|---|------|--------|----------------------------------|
|1. |GET   |/found-persons/       |Mengambil semua data di tabel found persons |
|2. |GET   |/found-persons/:id    |Mengambil data found persons berdasarkan id|
|3. |POST   |/found-persons/    |Menginputkan data baru ke tabel found persons|
|4. |PUT   |/found-persons/:id    |Mengedit data found persons berdasarkan id|
|5. |DELETE   |/found-persons/:id    |Menghapus data found persons berdasarkan id|
|6. |GET   |/found-persons/logs/:id    |Mengambil data found persons berdasarkan user id|

* Notifications
  
|No.|Method|Endpoint|Deskripsi                         |
|---|------|--------|----------------------------------|
|1. |GET   |/notifications/       |Mengambil semua data di tabel notifications |
|2. |GET   |/notifications/user/:id    |Mengambil data notifications berdasarkan id|
|3. |POST   |/notifications/    |Menginputkan data baru ke tabel notifications|
|4. |PUT   |/notifications/:id    |Mengedit data notifications berdasarkan id|
|5. |DELETE   |/notifications/:id    |Menghapus data notifications berdasarkan id|

* News

|No.|Method|Endpoint|Deskripsi                         |
|---|------|--------|----------------------------------|
|1. |GET   |/news/       |Mengambil semua data di tabel news |
|2. |GET   |/news/user/:id    |Mengambil data news berdasarkan id|
|3. |POST   |/news/    |Menginputkan data baru ke tabel news|
|4. |PUT   |/news/:id    |Mengedit data news berdasarkan id|
|5. |DELETE   |/news/:id    |Menghapus data news berdasarkan id|

### 2.b Auth
* JWT
* Google Oauth
### 2.c API Complex

|No.|Method|Endpoint|Deskripsi                         |
|---|------|--------|----------------------------------|
|1. |GET   |/claims/details:id       |Mengambil data di tabel claims dan found person berdasarkan id claims |
|2. |GET   |/reports/details:id    |Mengambil data di tabel reports dan missing persons berdasarkan id reports|
|3. |GET   |/missing-persons/details:id    |Mengambil data di tabel reports dan missing persons berdasarkan id missing persons|
|4. |GET   |/found-persons/details:id    |Mengambil data di tabel claims dan found person berdasarkan id found person|
|5. |POST   |/auth/register    |Mengambil data dari tabel users jika data tidak ada maka input data|
|6. |GET   |/news/latest    |Mengambil 5 data terbaru dari tabel news|
|7. |GET   |/news/:category    |Mengambil data dari tabel news berdsarkan category|
|8. |GET   |/news/:author    |Mengambil data dari tabel news berdasarkan author|
|9. |GET   |/news/total    |Mengambil total data dari tabel news|

### 2.d API NoSQL (Redis)
|No.|Key                            |Deskripsi      |
|---|------                         |--------      |
|1. |news:all                       |semua data tabel news       |
|2. |news:latest                    |5 data tabel news terbaru     |
|3. |news:category:${category}      |data tabel news berdasarkan category       |
|4. |claims:all                     |semua data tabel claims       |
|5. |claims:${user_id}              |data tabel claims berdasarkan useer_id       |
|6. |reports:all                    |semua data tabel reports       |
|7. |reports:${user_id}             |data tabel reports berdasarkan user_id       |
|8. |found_persons:all              |semua data tabel found persons       |
|9. |found_persons:${user_id}       |data tabel found persons berdasarkan user_id       |
|10. |missing_persons:all           |semua data tabel missing persons       |
|11. |missing_persons:${user_id}    |data tabel missing persons berdasarkan user_id       |
### 2.e Rate Limiting and Throttling
Menggunakan library Node.js: 
* "express-rate-limit" untuk Rate Limiting
* "express-slow-down" untuk throttling

Rate Limiting dan Throttling 
```
└── 📁 Middleware 
    └── rateLimiting.js
    └── throttling.js
```   


