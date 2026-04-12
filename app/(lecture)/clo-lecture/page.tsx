"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import type { CLO, DeCuongChiTiet, HocPhan } from "@/features/clo/types";
import { listClo, listDeCuong, listHocPhan } from "@/features/clo/api";

export default function CloReadOnlyPage() {
  const [maHocPhan, setMaHocPhan] = useState<string | undefined>();
  const [maDeCuong, setMaDeCuong] = useState<string | undefined>();
  const [q, setQ] = useState("");

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

  const { data: deCuongs = [] } = useQuery({
    queryKey: ["de-cuong-chi-tiet", { maHocPhan }],
    queryFn: () => listDeCuong(maHocPhan!),
    enabled: !!maHocPhan,
  });

  const dcOptions = useMemo(
    () =>
      deCuongs.map((dc: DeCuongChiTiet) => ({
        label: `${dc.phienBan} (${dc.trangThai})`,
        value: dc.maDeCuong,
      })),
    [deCuongs]
  );

  useMemo(() => {
    if (!maHocPhan || deCuongs.length === 0) return;
    const active = deCuongs.find((dc) => dc.trangThai === "active");
    if (active) setMaDeCuong(active.maDeCuong);
    else if (deCuongs.length === 1) setMaDeCuong(deCuongs[0].maDeCuong);
  }, [maHocPhan, deCuongs]);

  const cloQueryKey = useMemo(() => ["clo", { maDeCuong }], [maDeCuong]);

  const { data: rowsRaw = [], isLoading } = useQuery({
    queryKey: cloQueryKey,
    enabled: !!maDeCuong,
    queryFn: () => listClo(maDeCuong!),
  });

  const rows = useMemo(() => {
    if (!q.trim()) return rowsRaw;
    const s = q.trim().toLowerCase();
    return rowsRaw.filter(
      (x) =>
        (x.code ?? "").toLowerCase().includes(s) ||
        x.noiDungChuanDauRa.toLowerCase().includes(s)
    );
  }, [rowsRaw, q]);

  const columns: ColumnsType<CLO> = [
    {
      title: "Code",
      dataIndex: "code",
      width: 120,
      render: (v) => (v ? <Tag color="blue">{v}</Tag> : "-")
    },
    {
      title: "Nội dung chuẩn đầu ra (CLO)",
      dataIndex: "noiDungChuanDauRa",
      ellipsis: false
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 20 }} wrap>
        <Space wrap>
          <Select
            style={{ width: 420 }}
            placeholder="Chọn học phần để xem CLO..."
            options={hpOptions}
            value={maHocPhan}
            onChange={(v) => {
              setMaHocPhan(v);
              setMaDeCuong(undefined);
              setQ("");
            }}
            showSearch
            optionFilterProp="label"
          />

          <Select
            style={{ width: 280 }}
            placeholder="Chọn đề cương"
            options={dcOptions}
            value={maDeCuong}
            onChange={(v) => {
              setMaDeCuong(v);
              setQ("");
            }}
            disabled={!maHocPhan || deCuongs.length === 0}
            showSearch
            optionFilterProp="label"
          />

          <Input.Search
            placeholder="Tìm theo code / nội dung..."
            allowClear
            onSearch={setQ}
            style={{ width: 280 }}
            disabled={!maDeCuong}
          />
        </Space>
      </Space>

      <Table
        rowKey="maCLO"
        loading={isLoading && !!maDeCuong}
        columns={columns}
        dataSource={maDeCuong ? rows : []}
        pagination={{ pageSize: 10 }}
        bordered
      />
    </div>
  );
}
