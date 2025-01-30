Add to your .env:
DATABASE_URL="postgresql://postgres:password@localhost:5432/FUSE_DB"
JWT_SECRET=.....
RSA_PRIVATE=..... (openssl genrsa -out keys/private.pem 4096 || openssl rsa -in keys/private.pem -pubout -out keys/public.pem)

Run:
npm install
npx prisma migrate dev --name "init"
npx prisma generate

-----------------------------------------------------
Endpoints :

GET      \
POST     \gate\generate\bill
GET      \gate\check\:id
POST     \key\dashboard\generate
POST     \key\publicKey
POST     \key\setAESkey
POST     \key\reg\publicKey
POST     \key\reg\setAESkey
POST     \auth\login
POST     \auth\register
POST     \auth\dashboard\login
POST     \auth\register\employee
GET      \auth\logout
GET      \user\
GET      \user\:id
PUT      \user\:id
DELETE   \user\:id
POST     \user\received
POST     \user\sent
POST     \user\expenses
GET      \merchant\
GET      \merchant\:id
PUT      \merchant\:id
DELETE   \merchant\:id
GET      \beneficiarie\
POST     \beneficiarie\
GET      \beneficiarie\:id
PUT      \beneficiarie\:id
DELETE   \beneficiarie\:id
GET      \account\
POST     \account\
POST     \account\user
POST     \account\user\:id
POST     \account\:id
PUT      \account\:id
DELETE   \account\:id
GET      \card\
POST     \card\
POST     \card\account\:id
POST     \card\user
POST     \card\:id
PUT      \card\pin\:id
PUT      \card\balance\:id
DELETE   \card\:id
POST     \transaction\all
POST     \transaction\topUp
POST     \transaction\fromTo
POST     \transaction\cash\deposit
POST     \transaction\cash\withdraw
POST     \transaction\transfer
POST     \transaction\:id
PUT      \transaction\:id
DELETE   \transaction\:id
PUT      \bill\
POST     \bill\unpaid
POST     \bill\:id
POST     \bill\pay\:id
