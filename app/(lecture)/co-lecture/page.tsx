"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import type { CO, HocPhan } from "@/features/co/types";
// Chỉ import hàm lấy danh sách (list), gỡ bỏ create, update, delete
import { listCo, listHocPhan } from "@/features/co/api";

export default function CoReadOnlyPage() {
  const [maHocPhan, setMaHocPhan] = useState<string | undefined>();
  const [q, setQ] = useState("");

  // 1. Fetch danh sách Học phần để đưa vào Select
  const { data: hocPhans = [] } = useQuery({
    queryKey: ["hoc-phan"],
    queryFn: listHocPhan,
  });

  const hpOptions = useMemo(
    () =>
      hocPhans.map((hp: HocPhan) => ({
        label: `${hp.tenHocPhan} (${hp.maHocPhan})`,
        value: hp.maHocPhan,
      })),
    [hocPhans]
  );

  const coQueryKey = useMemo(() => ["co", { maHocPhan }], [maHocPhan]);

  // 2. Fetch danh sách CO dựa vào Học phần đã chọn
  const { data: rowsRaw = [], isLoading } = useQuery({
    queryKey: coQueryKey,
    enabled: !!maHocPhan,
    queryFn: () => listCo(maHocPhan!),
  });

  // 3. Logic thanh Tìm kiếm (Search)
  const rows = useMemo(() => {
    if (!q.trim()) return rowsRaw;
    const s = q.trim().toLowerCase();
    return rowsRaw.filter(
      (x) =>
        (x.code ?? "").toLowerCase().includes(s) ||
        x.noiDungChuanDauRa.toLowerCase().includes(s)
    );
  }, [rowsRaw, q]);

  // 4. Cấu hình cột hiển thị (Đã gỡ bỏ cột Hành Động)
  const columns: ColumnsType<CO> = [
    { 
      title: "Code", 
      dataIndex: "code", 
      width: 120, 
      render: (v) => (v ? <Tag color="blue">{v}</Tag> : "-") 
    },
    { 
      title: "Nội dung chuẩn đầu ra CO", 
      dataIndex: "noiDungChuanDauRa", 
      ellipsis: false // Tắt ellipsis để Giảng viên đọc được toàn bộ câu dài
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 20 }} wrap>
        <Space wrap>
          <Select
            style={{ width: 420 }}
            placeholder="Chọn học phần để xem CO..."
            options={hpOptions}
            value={maHocPhan}
            onChange={(v) => {
              setMaHocPhan(v);
              setQ(""); // Xóa thanh tìm kiếm khi đổi môn khác
            }}
            showSearch
            optionFilterProp="label"
          />

          <Input.Search
            placeholder="Tìm theo code / nội dung..."
            allowClear
            onSearch={setQ}
            style={{ width: 280 }}
            disabled={!maHocPhan} // Khóa ô search nếu chưa chọn môn
          />
        </Space>
      </Space>

      <Table
        rowKey="maCO"
        loading={isLoading && !!maHocPhan}
        columns={columns}
        dataSource={maHocPhan ? rows : []}
        pagination={{ pageSize: 10 }}
        bordered
      />
    </div>
  );
}