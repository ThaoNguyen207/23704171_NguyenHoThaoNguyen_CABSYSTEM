# CUSTOMER API TEST CASES

## Phạm vi kiểm thử

- Đăng ký tài khoản khách hàng
- Đăng nhập tài khoản khách hàng
- Kiểm tra dữ liệu không hợp lệ
- Kiểm tra tài khoản trùng, không tồn tại hoặc bị khóa

---

## TC-001 – Đăng ký tài khoản thành công

| Thuộc tính | Nội dung |
|---|---|
| Test Case ID | TC-001 |
| FR/UC | UC01 |
| Business Rule | BRL01 |
| Endpoint | `/api/customers/register` |
| Method | `POST` |
| Loại kiểm thử | Positive |
| Tiền điều kiện | Số điện thoại và email chưa tồn tại |
| Xác thực | Không yêu cầu token |

### Input

```json
{
  "fullName": "Nguyễn An",
  "phone": "0901234567",
  "email": "an@example.com",
  "password": "Cab@1234"
}
