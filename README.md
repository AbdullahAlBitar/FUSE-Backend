# FUSE: Financial Universal Service Ecosystem

## Overview
FUSE is a comprehensive financial service ecosystem backend developed as a junior project. It provides a robust API for handling various financial operations including user authentication, transaction processing, bill payments, and merchant services.

## Documentation
Detailed project documentation can be found [here](https://drive.google.com/file/d/1e5Md-OdN4G0OEmQsxQEkxhzDApd_nhV4/view?usp=sharing).

## Security & Encryption
All endpoints in this API implement end-to-end encryption for data transmission. Both request and response data are encrypted to ensure maximum security.

### Testing Encrypted Endpoints
The project includes an `encryption-scripts` directory containing tools and instructions for testing the encrypted endpoints. To test the API endpoints:

1. Navigate to the `encryption-scripts` directory
2. Refer to the README file in that directory for detailed testing procedures
3. Use the provided scripts to encrypt your request data and decrypt the responses

> **Note**: Always test the encryption/decryption process before making actual API calls to ensure proper data handling.

## Prerequisites
- Node.js and npm
- PostgreSQL
- OpenSSL (for key generation)

## Setup Instructions

### Environment Variables
Create a `.env` file in the root directory with the following configurations:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/FUSE_DB"
JWT_SECRET="your-jwt-secret"
RSA_PRIVATE="your-rsa-private-key"
```

### Generate RSA Keys
```bash
openssl genrsa -out keys/private.pem 4096
openssl rsa -in keys/private.pem -pubout -out keys/public.pem
```

### Installation
```bash
# Install dependencies
npm install

# Initialize database
npx prisma migrate dev --name "init"
npx prisma generate
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User registration |
| POST | `/auth/dashboard/login` | Dashboard login |
| POST | `/auth/register/employee` | Employee registration |
| GET | `/auth/logout` | User logout |

### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/` | Get all users |
| GET | `/user/:id` | Get user by ID |
| PUT | `/user/:id` | Update user |
| DELETE | `/user/:id` | Delete user |
| POST | `/user/received` | Get received transactions |
| POST | `/user/sent` | Get sent transactions |
| POST | `/user/expenses` | Get user expenses |

### Account & Card Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/account/` | Get all accounts |
| POST | `/account/` | Create account |
| POST | `/account/user/:id` | Create user account |
| GET | `/card/` | Get all cards |
| POST | `/card/account/:id` | Create card for account |
| PUT | `/card/pin/:id` | Update card PIN |
| PUT | `/card/balance/:id` | Update card balance |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/transaction/all` | Get all transactions |
| POST | `/transaction/topUp` | Top up account |
| POST | `/transaction/transfer` | Transfer funds |
| POST | `/transaction/cash/deposit` | Cash deposit |
| POST | `/transaction/cash/withdraw` | Cash withdrawal |

### Bill Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/bill/` | Update bill |
| POST | `/bill/unpaid` | Get unpaid bills |
| POST | `/bill/pay/:id` | Pay bill |

### Merchant Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/merchant/` | Get all merchants |
| POST | `/merchant/generate/bill` | Generate merchant bill |
| PUT | `/merchant/:id` | Update merchant |

### Security
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/key/getPublic` | Get public key |
| POST | `/key/setAESKey` | Set AES key |
| POST | `/gate/generate/bill` | Generate secure bill |
| GET | `/gate/check/:id` | Security check |
