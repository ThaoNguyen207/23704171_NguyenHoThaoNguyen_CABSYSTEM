openapi: 3.0.0
info:
  title: CAB System - Payment & Rating API
  version: 1.0.0
  description: API thanh toán và đánh giá tài xế (FR09-FR15, FR43-FR46)[cite: 4].
paths:
  /api/trips/{tripId}/payments:
    post:
      summary: Thanh toán chuyến xe (UC19, UC20)[cite: 4].
      description: Xử lý thanh toán, lưu TransactionCode, không lưu thẻ (BRL16)[cite: 4].
      parameters:
        - name: tripId
          in: path
          required: true
          schema: { type: integer }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                paymentMethodId: { type: integer }
                amount: { type: number }
                transactionCode: { type: string }
      responses:
        '200':
          description: Thanh toán thành công (AC06.3)[cite: 4].
  /api/trips/{tripId}/ratings:
    post:
      summary: Đánh giá tài xế (UC22)[cite: 4].
      parameters:
        - name: tripId
          in: path
          required: true
          schema: { type: integer }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                score: { type: integer }
                comment: { type: string }
      responses:
        '201':
          description: Đánh giá được lưu (AC07.5)[cite: 4].
