# Customer API

## 1. Register Customer
**Endpoint:** `POST /api/customers/register`
**Description:** Khách hàng đăng ký tài khoản mới (FR15, BRL01).

**Request Body:**
```json
{
  "fullName": "Nguyen Van A",
  "phone": "0901234567",
  "email": "nguyenvana@gmail.com",
  "password": "password123"
}
