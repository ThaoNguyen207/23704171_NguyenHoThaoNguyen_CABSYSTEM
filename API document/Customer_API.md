openapi: 3.0.0
info:
  title: CAB System - Customer API
  version: 1.0.0
  description: API quản lý khách hàng bao gồm đăng ký và đăng nhập (UC01, UC02)[cite: 4].
paths:
  /api/customers/register:
    post:
      summary: Đăng ký tài khoản khách hàng (UC01)[cite: 4].
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                fullName: { type: string }
                phone: { type: string }
                email: { type: string }
                password: { type: string }
      responses:
        '201':
          description: Đăng ký thành công (BRL01)[cite: 4].
  /api/customers/login:
    post:
      summary: Đăng nhập (UC02)[cite: 4].
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                phone: { type: string }
                password: { type: string }
      responses:
        '200':
          description: Đăng nhập thành công, trả về Token (NFR05)[cite: 4].
