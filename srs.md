# CAB SYSTEM – PHÂN TÍCH YÊU CẦU

---

# BƯỚC 1: PHÂN TÍCH YÊU CẦU KHÁCH HÀNG

## 1. Business Context – Bối cảnh nghiệp vụ

Công ty ABC là doanh nghiệp cung cấp dịch vụ đặt xe trực tuyến (CAB).
Hiện tại, khách hàng có thể yêu cầu xe thông qua tổng đài hoặc một ứng dụng
đơn giản.

Hệ thống hiện tại đang tồn tại một số hạn chế trong quá trình vận hành,
đặc biệt khi số lượng khách hàng và tài xế tăng lên. Doanh nghiệp mong muốn
xây dựng một nền tảng CAB mới có khả năng hỗ trợ quy trình đặt xe,
quản lý tài xế, thanh toán và vận hành một cách tập trung, đồng thời có
khả năng mở rộng trong tương lai.

---

## 2. Business Problem – Vấn đề nghiệp vụ

### 2.1. Phân công tài xế còn thủ công

Việc phân công tài xế hiện tại chủ yếu được thực hiện thủ công,
gây mất thời gian và khó mở rộng khi số lượng khách hàng và tài xế tăng.

### 2.2. Khách hàng khó theo dõi chuyến đi

Khách hàng khó biết được hệ thống đang tìm tài xế nào, tài xế đã nhận
chuyến hay chưa và trạng thái hiện tại của chuyến đi.

### 2.3. Thông tin thanh toán chưa được quản lý tập trung

Thông tin liên quan đến thanh toán chưa được quản lý tập trung,
gây khó khăn cho việc theo dõi và tra cứu giao dịch.

### 2.4. Khó khăn trong vận hành và mở rộng

Bộ phận vận hành gặp khó khăn khi quản lý số lượng lớn khách hàng,
tài xế và chuyến đi. Hệ thống hiện tại cũng chưa đủ linh hoạt để mở rộng
các chức năng trong tương lai.

### 2.5. Khả năng mở rộng hệ thống còn hạn chế

Doanh nghiệp mong muốn có thể bổ sung các loại dịch vụ mới,
phương thức thanh toán mới và các kênh thông báo mới mà không phải
xây dựng lại toàn bộ hệ thống.

---

# BƯỚC 2: XÁC ĐỊNH VÀ PHÂN TÍCH STAKEHOLDER

## 1. Danh sách Stakeholder

| Tên | Vai trò |
|---|---|
| Ban giám đốc | Định hướng dự án, xác định mục tiêu kinh doanh, phê duyệt các quyết định quan trọng và theo dõi hiệu quả hoạt động |
| Khách hàng | Sử dụng hệ thống để đăng ký, đặt xe, theo dõi chuyến đi, thanh toán và đánh giá tài xế |
| Tài xế | Nhận chuyến, chấp nhận/từ chối chuyến, cập nhật trạng thái chuyến và thực hiện chuyến xe |
| Nhân viên vận hành | Quản lý khách hàng, tài xế, phương tiện và chuyến đi; theo dõi và xử lý các trường hợp phát sinh |
| Bộ phận phát triển hệ thống | Phân tích, thiết kế, xây dựng, kiểm thử và triển khai hệ thống CAB |
| Nhà cung cấp thanh toán | Cung cấp dịch vụ thanh toán điện tử và trả kết quả giao dịch cho hệ thống CAB |
| Nhà cung cấp dịch vụ thông báo | Cung cấp các kênh gửi thông báo như Email, SMS hoặc các kênh khác trong tương lai |

---

## 2. Stakeholder Matrix

Ma trận Stakeholder được xây dựng dựa trên hai tiêu chí:

- **Mức độ ảnh hưởng (Influence):** Khả năng tác động đến quyết định,
  hoạt động và kết quả của dự án.
- **Mức độ quan trọng (Importance):** Mức độ cần thiết của stakeholder
  đối với việc đáp ứng mục tiêu và yêu cầu của hệ thống.

### Phân loại

| Nhóm | Chiến lược |
|---|---|
| Ảnh hưởng cao – Quan trọng cao | Quản lý chặt chẽ, thường xuyên trao đổi và xác nhận |
| Ảnh hưởng cao – Quan trọng thấp | Duy trì sự hài lòng và theo dõi |
| Ảnh hưởng thấp – Quan trọng cao | Thường xuyên cập nhật và thu thập phản hồi |
| Ảnh hưởng thấp – Quan trọng thấp | Theo dõi và cập nhật khi cần |

### Biểu đồ Stakeholder Matrix
## 2. Stakeholder Matrix

```mermaid
quadrantChart
    title Stakeholder Matrix - CAB System
    x-axis "Ảnh hưởng thấp" --> "Ảnh hưởng cao"
    y-axis "Tầm quan trọng thấp" --> "Tầm quan trọng cao"

    quadrant-1 "Quản lý chặt chẽ"
    quadrant-2 "Cập nhật thường xuyên"
    quadrant-3 "Theo dõi"
    quadrant-4 "Duy trì hài lòng"

    "Ban giám đốc": [0.90, 0.95]
    "Khách hàng": [0.65, 0.95]
    "Tài xế": [0.60, 0.85]
    "Nhân viên vận hành": [0.80, 0.90]
    "Business Analyst": [0.75, 0.80]
    "Bộ phận phát triển": [0.70, 0.75]
    "Nhà cung cấp thanh toán": [0.45, 0.55]
    "Nhà cung cấp thông báo": [0.30, 0.40]
```
# BƯỚC 3: XÁC ĐỊNH BUSINESS GOAL VÀ BUSINESS REQUIREMENT

## 3.1. Xác định Business Goal

Dựa trên Business Problem và các Stakeholder đã xác định, hệ thống CAB
cần đạt được các mục tiêu nghiệp vụ chính:

- Giảm thời gian tìm và phân công tài xế.
- Hỗ trợ khách hàng đặt xe và theo dõi chuyến đi.
- Hỗ trợ nhiều phương thức thanh toán.
- Quản lý tập trung thông tin chuyến đi và giao dịch.
- Hỗ trợ nhân viên vận hành quản lý hệ thống.
- Cung cấp thông báo kịp thời.
- Có khả năng mở rộng trong tương lai.

---

## 3.2. Xác định Business Requirement

### BR01 – Giảm thời gian tìm tài xế

Hệ thống tự động tìm tài xế phù hợp dựa trên vị trí và trạng thái
sẵn sàng của tài xế.

- Ưu tiên tài xế phù hợp và gần khách hàng.
- Nếu tài xế từ chối hoặc không phản hồi, hệ thống tiếp tục tìm tài xế khác.
- Nếu không tìm được tài xế, thông báo cho khách hàng.

### BR02 – Hỗ trợ thanh toán

Hệ thống cho phép khách hàng thanh toán bằng:

- Tiền mặt.
- Thanh toán điện tử thông qua nhà cung cấp thanh toán bên ngoài.

### BR03 – Theo dõi chuyến đi

Khách hàng có thể theo dõi trạng thái chuyến đi:

**Đang tìm tài xế → Đã có tài xế → Tài xế đã đến → Đã đón khách
→ Đang di chuyển → Hoàn thành**

### BR04 – Quản lý thông tin chuyến đi

Hệ thống quản lý tập trung:

- Khách hàng.
- Tài xế.
- Phương tiện.
- Điểm đón, điểm đến.
- Trạng thái chuyến.
- Chi phí.
- Thanh toán.
- Lịch sử chuyến đi.

### BR05 – Hỗ trợ nhân viên vận hành

Nhân viên vận hành có thể:

- Quản lý khách hàng.
- Quản lý tài xế.
- Quản lý phương tiện.
- Theo dõi chuyến đang diễn ra.
- Kiểm tra trạng thái tài xế.
- Xử lý các trường hợp chuyến bị lỗi.
- Tra cứu giao dịch.

### BR06 – Hỗ trợ thông báo

Hệ thống thông báo cho khách hàng và tài xế khi:

- Yêu cầu đặt xe được tiếp nhận.
- Tài xế nhận chuyến.
- Tài xế đến điểm đón.
- Chuyến đi hoàn thành.
- Thanh toán có kết quả.
- Có chuyến mới dành cho tài xế.

### BR07 – Đánh giá tài xế

Sau khi chuyến đi hoàn thành, khách hàng có thể đánh giá tài xế.

### BR08 – Khả năng mở rộng

Hệ thống có khả năng bổ sung:

- Loại dịch vụ mới.
- Phương thức thanh toán mới.
- Nhà cung cấp thông báo mới.
- Các thành phần kỹ thuật mới.

Mà không phải xây dựng lại toàn bộ hệ thống.

---

## 3.3. Business Goal cho phiên bản MVP

Trong thời gian 7 tuần, MVP tập trung vào quy trình nghiệp vụ chính:

**Đặt xe → Tìm tài xế → Nhận chuyến → Thực hiện chuyến
→ Hoàn thành → Tính cước → Thanh toán → Đánh giá**
# BƯỚC 4: XÁC ĐỊNH PHẠM VI YÊU CẦU (SCOPE)

## 4.1. Mục tiêu xác định phạm vi

Xác định rõ các chức năng cần xây dựng trong phiên bản MVP của CAB System
nhằm đảm bảo nhóm tập trung vào các nghiệp vụ cốt lõi, tránh phát triển
những chức năng chưa cần thiết hoặc vượt quá thời gian 7 tuần.

Phạm vi được chia thành:

- **In Scope:** Các chức năng cần triển khai trong MVP.
- **Out of Scope:** Các chức năng chưa triển khai trong MVP nhưng có thể
  xem xét ở các phiên bản sau.

---

## 4.2. Phạm vi chức năng của MVP

| STT | Module | Chức năng chính | Phạm vi MVP |
|---|---|---|---|
| 1 | Quản lý khách hàng | Đăng ký, đăng nhập, cập nhật thông tin cá nhân | In Scope |
| 2 | Quản lý khách hàng | Đặt xe, nhập điểm đón và điểm đến, chọn loại xe | In Scope |
| 3 | Quản lý khách hàng | Theo dõi trạng thái chuyến đi | In Scope |
| 4 | Quản lý khách hàng | Xem lịch sử chuyến đi | In Scope |
| 5 | Quản lý khách hàng | Xem chi phí và trạng thái thanh toán | In Scope |
| 6 | Quản lý khách hàng | Đánh giá tài xế | In Scope |
| 7 | Quản lý tài xế | Đăng nhập và quản lý hồ sơ | In Scope |
| 8 | Quản lý tài xế | Quản lý thông tin phương tiện | In Scope |
| 9 | Quản lý tài xế | Chuyển trạng thái sẵn sàng/không sẵn sàng | In Scope |
| 10 | Quản lý tài xế | Nhận thông báo chuyến mới | In Scope |
| 11 | Quản lý tài xế | Chấp nhận/từ chối chuyến | In Scope |
| 12 | Quản lý tài xế | Cập nhật trạng thái chuyến | In Scope |
| 13 | Quản lý chuyến đi | Tạo và quản lý yêu cầu đặt xe | In Scope |
| 14 | Quản lý chuyến đi | Tìm và phân công tài xế | In Scope |
| 15 | Quản lý chuyến đi | Xử lý trường hợp tài xế từ chối/không phản hồi | In Scope |
| 16 | Quản lý chuyến đi | Cập nhật trạng thái chuyến | In Scope |
| 17 | Tính cước | Tính số tiền khách hàng phải trả | In Scope |
| 18 | Thanh toán | Thanh toán tiền mặt | In Scope |
| 19 | Thanh toán | Thanh toán điện tử mô phỏng | In Scope |
| 20 | Thông báo | Thông báo các sự kiện chính của chuyến đi | In Scope |
| 21 | Quản lý vận hành | Quản lý khách hàng | In Scope |
| 22 | Quản lý vận hành | Quản lý tài xế | In Scope |
| 23 | Quản lý vận hành | Quản lý phương tiện | In Scope |
| 24 | Quản lý vận hành | Theo dõi các chuyến đang diễn ra | In Scope |
| 25 | Quản lý vận hành | Tra cứu lịch sử chuyến đi/giao dịch | In Scope |
| 26 | Quản lý tài khoản | Phân quyền nhân viên vận hành | In Scope |

---

## 4.3. Các chức năng Out of Scope

Các chức năng sau chưa triển khai trong phiên bản MVP do thời gian
xây dựng giới hạn 7 tuần:

| STT | Chức năng | Lý do chưa triển khai |
|---|---|---|
| 1 | Định vị GPS realtime chính xác | Phức tạp, không cần thiết để chứng minh MVP |
| 2 | Thuật toán tối ưu phân công tài xế nâng cao | Có thể phát triển sau khi MVP hoạt động |
| 3 | Tích hợp nhiều nhà cung cấp thanh toán thật | MVP chỉ cần mô phỏng thanh toán điện tử |
| 4 | Tích hợp SMS/Email/Zalo thực tế | MVP có thể sử dụng thông báo trong hệ thống |
| 5 | Báo cáo BI nâng cao | Chưa phải chức năng cốt lõi của MVP |
| 6 | Hệ thống định giá/cước phức tạp | MVP sử dụng quy tắc tính cước cơ bản |
| 7 | Quản lý nhiều loại dịch vụ phức tạp | Chưa cần thiết trong phiên bản demo |
| 8 | Hệ thống xử lý tải lớn thực tế | Chỉ thiết kế theo hướng có khả năng mở rộng |
| 9 | Theo dõi vị trí tài xế theo thời gian thực | Có thể triển khai ở phiên bản sau |
| 10 | Tích hợp nhiều kênh thông báo | Để dành cho phiên bản mở rộng |

---

## 4.4. Xác định các Module của hệ thống

MVP CAB System được chia thành các module chính:

### Module 1 – Quản lý khách hàng

Bao gồm:
- Đăng ký / đăng nhập.
- Quản lý thông tin cá nhân.
- Đặt xe.
- Theo dõi chuyến.
- Xem lịch sử.
- Đánh giá tài xế.

### Module 2 – Quản lý tài xế

Bao gồm:
- Đăng nhập.
- Quản lý hồ sơ.
- Quản lý phương tiện.
- Cập nhật trạng thái hoạt động.
- Nhận và xử lý yêu cầu chuyến.
- Cập nhật trạng thái chuyến.

### Module 3 – Quản lý chuyến đi

Bao gồm:
- Tạo yêu cầu đặt xe.
- Tìm tài xế.
- Phân công tài xế.
- Xử lý tài xế từ chối/không phản hồi.
- Theo dõi trạng thái chuyến.
- Hoàn thành chuyến.

### Module 4 – Tính cước và thanh toán

Bao gồm:
- Tính cước.
- Thanh toán tiền mặt.
- Thanh toán điện tử mô phỏng.
- Cập nhật trạng thái thanh toán.

### Module 5 – Thông báo

Bao gồm:
- Thông báo đặt xe.
- Thông báo tài xế nhận chuyến.
- Thông báo tài xế đến.
- Thông báo hoàn thành chuyến.
- Thông báo kết quả thanh toán.

### Module 6 – Quản lý vận hành

Bao gồm:
- Quản lý khách hàng.
- Quản lý tài xế.
- Quản lý phương tiện.
- Theo dõi chuyến đi.
- Tra cứu giao dịch.
- Xử lý chuyến bị lỗi.

### Module 7 – Quản lý tài khoản và phân quyền

Bao gồm:
- Đăng nhập.
- Phân quyền khách hàng.
- Phân quyền tài xế.
- Phân quyền nhân viên vận hành.

---

## 4.5. MVP Boundary

### In Scope – Tiếp tục triển khai

Các chức năng thuộc luồng nghiệp vụ chính:

**Khách hàng**
→ Đặt xe
→ Hệ thống tìm tài xế
→ Tài xế nhận chuyến
→ Tài xế thực hiện chuyến
→ Hoàn thành
→ Tính cước
→ Thanh toán
→ Đánh giá.

Đồng thời triển khai các chức năng quản trị cơ bản:

**Quản lý khách hàng + Quản lý tài xế + Quản lý phương tiện
+ Quản lý chuyến đi + Tra cứu thanh toán.**

### Out of Scope – Không triển khai trong MVP

Các chức năng nâng cao như:

**GPS realtime + tích hợp thanh toán thật nhiều nhà cung cấp
+ SMS/Email/Zalo thật + thuật toán phân công nâng cao
+ báo cáo BI nâng cao + định giá phức tạp.**

Các chức năng Out of Scope có thể được xem xét và triển khai
ở các phiên bản tiếp theo.

---

## 4.6. Kết luận phạm vi

Phạm vi MVP tập trung vào việc chứng minh quy trình nghiệp vụ cốt lõi
của CAB System và các chức năng quản lý cần thiết.

Mọi chức năng không phục vụ trực tiếp cho quy trình:

**Đặt xe → Tìm tài xế → Nhận chuyến → Thực hiện chuyến
→ Hoàn thành → Thanh toán → Đánh giá**

hoặc không cần thiết cho việc quản lý vận hành cơ bản sẽ được xem xét
đưa ra ngoài phạm vi MVP.
