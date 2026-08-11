# Implementation Plan — Full UAT Remediation

Ngày phê duyệt: 2026-08-11

## Mục tiêu

Rà soát toàn bộ source và tài liệu Full UAT, xử lý các lỗi Critical/High có thể xác minh an toàn trên source, bổ sung kiểm thử hồi quy, chạy development smoke test và phát hành thay đổi trên một nhánh GitHub mới bắt nguồn từ `origin/main`.

## Kế hoạch đã phê duyệt

1. Tạo worktree/nhánh riêng từ phiên bản mới nhất của `origin/main`, không ghi đè checkout local hiện hữu. — Hoàn thành
2. Kiểm kê từng test ID trong 25 kế hoạch Full UAT và checklist field UC03. — Hoàn thành
3. Chạy baseline build, test, lint, audit và runtime smoke. — Hoàn thành
4. Sửa các khoảng trống Critical/High về secret, authorization/session, UC18, picking, idempotency và dual ledger. — Hoàn thành
5. Chạy lại quality gates và lập báo cáo nghiệm thu trung thực. — Hoàn thành
6. Commit, push nhánh và mở Draft PR; không merge. — Hoàn thành tại PR #3

## Giới hạn an toàn

- Không chạy migration hoặc test ghi dữ liệu trên SQL Server đang được cấu hình vì chưa có bằng chứng đó là DB UAT cô lập.
- Không đánh dấu PASS cho test case nghiệp vụ chỉ dựa trên code review hoặc automated test.
- Không dùng `reset --hard`, không ghi đè thay đổi local, không merge PR.
