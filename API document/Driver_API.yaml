openapi: 3.0.0
info:
  title: CAB System - Driver API
  version: 1.0.0
  description: API quản lý trạng thái và phương tiện của tài xế (UC11, UC17)[cite: 4].
paths:
  /api/drivers/{driverId}/status:
    patch:
      summary: Cập nhật trạng thái sẵn sàng (UC11)[cite: 4].
      description: Tài xế bật/tắt trạng thái sẵn sàng nhận chuyến (FR02, BRL04)[cite: 4].
      parameters:
        - name: driverId
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
                availabilityStatus: { type: string, enum: [READY, BUSY, OFFLINE] }
      responses:
        '200':
          description: Cập nhật thành công[cite: 4].
