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

### Các bên liên quan chính

- Khách hàng: Đặt xe và sử dụng dịch vụ.
- Tài xế: Nhận và thực hiện chuyến xe.
- Nhân viên vận hành: Quản lý khách hàng, tài xế, phương tiện và chuyến đi.
- Nhà cung cấp thanh toán: Hỗ trợ thanh toán điện tử.
- Ban lãnh đạo: Theo dõi hoạt động và báo cáo kinh doanh.

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

## 3. Business Goal – Mục tiêu nghiệp vụ

Xây dựng một nền tảng CAB có khả năng:

- Hỗ trợ khách hàng đặt xe trực tuyến.
- Tự động tìm và phân công tài xế phù hợp.
- Cho phép khách hàng theo dõi trạng thái chuyến đi.
- Quản lý tập trung thông tin chuyến đi và thanh toán.
- Hỗ trợ nhân viên vận hành quản lý hoạt động.
- Đảm bảo hệ thống có khả năng mở rộng trong tương lai.

### Mục tiêu của phiên bản MVP

Trong phạm vi 7 tuần, nhóm xây dựng phiên bản MVP nhằm demo
quy trình nghiệp vụ cốt lõi:

**Đặt xe → Tìm tài xế → Tài xế nhận chuyến → Thực hiện chuyến
→ Hoàn thành → Tính cước → Thanh toán → Đánh giá**
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
| Business Analyst | Thu thập, phân tích, làm rõ và xác nhận yêu cầu với các bên liên quan; xác định phạm vi và nghiệp vụ hệ thống |

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

### Stakeholder Matrix

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
    "Nhân viên vận hành": [0.80, 0.90]
    "Khách hàng": [0.65, 0.95]
    "Tài xế": [0.60, 0.85]
    "Business Analyst": [0.75, 0.80]
    "Bộ phận phát triển": [0.70, 0.75]
    "Nhà cung cấp thanh toán": [0.45, 0.55]
    "Nhà cung cấp thông báo": [0.30, 0.40]
