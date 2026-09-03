openapi: 3.0.0
info:
  title: CAB System - Trip API
  version: 1.0.0
  description: API xử lý đặt chuyến, phân công và trạng thái (FR01-FR08, FR16-FR21)[cite: 4].
paths:
  /api/trips:
    post:
      summary: Tạo chuyến xe mới (UC04)[cite: 4].
      description: Khách hàng yêu cầu đặt chuyến. Phải có điểm đón, điểm đến và loại xe (AC01.2, AC01.3)[cite: 4].
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                pickupLocation: { type: string }
                destination: { type: string }
                vehicleTypeId: { type: integer }
      responses:
        '201':
          description: Tạo thành công, trạng thái là `Searching` (AC01.6)[cite: 4].
  /api/trips/{tripId}/driver-response:
    post:
      summary: Tài xế Accept/Reject chuyến (UC13, UC14)[cite: 4].
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
                action: { type: string, enum: [ACCEPT, REJECT] }
      responses:
        '200':
          description: Ghi nhận phản hồi thành công (AC03.4)[cite: 4].
