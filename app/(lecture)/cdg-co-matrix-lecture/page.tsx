"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/api/http";

type HocPhan = {
  maHocPhan: string;
  tenHocPhan: string;
};

type CachDanhGia = {
  maCDG: string;
  maHocPhan: string;
  tenThanhPhan: string;
  cachDanhGia?: string | null;
  trongSo: string;
  loai?: string | null;
};

type CO = {
  maCO: string;
  maHocPhan: string;
  code?: string | null;
  noiDungChuanDauRa: string;
};

type CdgCoMapping = {
  maCDG: string;
  maCO: string;
  trongSo: string;
  ghiChu?: string | null;
};

type CdgCoMatrixResponse = {
  cdgs: CachDanhGia[];
  cos: CO[];
  mappings: CdgCoMapping[];
};

type MatrixRow = {
  key: string;
  maCDG: string;
  cdgName: string;
  cdgLoai?: string | null;
  cdgTrongSo: string;
  [key: string]: string | null | undefined;
};

async function listHocPhan() {
  const res = await http.get<HocPhan[]>("/hoc-phan");
  return res.data;
}

async function listCdgCoMatrix(maHocPhan: string) {
  const res = await http.get<CdgCoMatrixResponse>(
    `/hoc-phan/${maHocPhan}/cdg-co-mapping`
  );
  return res.data;
}

function buildCellKey(maCDG: string, maCO: string) {
  return `${maCDG}__${maCO}`;
}

export default function CdgCoMatrixPage() {
  const [maHocPhan, setMaHocPhan] = useState<string>();
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});

  const { data: hocPhans = [] } = useQuery({
    queryKey: ["hoc-phan"],
    queryFn: listHocPhan,
  });

  const { data: matrixData, isLoading } = useQuery({
    queryKey: ["cdg-co-mapping", maHocPhan],
    queryFn: () => listCdgCoMatrix(maHocPhan!),
    enabled: !!maHocPhan,
  });

  const cdgs = matrixData?.cdgs ?? [];
  const cos = matrixData?.cos ?? [];

  const initializedKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (!maHocPhan) {
      setDraftValues({});
      initializedKeyRef.current = null;
      return;
    }

    if (!matrixData) return;

    const mappingsList = matrixData.mappings ?? [];

    const initKey = JSON.stringify(
      mappingsList.map((m) => ({
        maCDG: m.maCDG,
        maCO: m.maCO,
        trongSo: String(m.trongSo),
      }))
    );

    if (initializedKeyRef.current === initKey) return;

    const next: Record<string, string> = {};
    mappingsList.forEach((m) => {
      next[buildCellKey(m.maCDG, m.maCO)] = String(m.trongSo);
    });

    initializedKeyRef.current = initKey;
    setDraftValues(next);
  }, [maHocPhan, matrixData]);

  const rows: MatrixRow[] = useMemo(() => {
    return cdgs.map((cdg) => {
      const row: MatrixRow = {
        key: cdg.maCDG,
        maCDG: cdg.maCDG,
        cdgName: cdg.tenThanhPhan,
        cdgLoai: cdg.loai,
        cdgTrongSo: cdg.trongSo,
      };

      cos.forEach((co) => {
        const key = buildCellKey(cdg.maCDG, co.maCO);
        row[co.maCO] = draftValues[key] ?? null;
      });

      return row;
    });
  }, [cdgs, cos, draftValues]);

  const getColumnTotal = (maCO: string) => {
    let total = 0;

    cdgs.forEach((cdg) => {
      const raw = draftValues[buildCellKey(cdg.maCDG, maCO)];
      if (raw != null && raw !== "") {
        total += Number(raw);
      }
    });

    return Number(total.toFixed(4));
  };

  const columns: ColumnsType<MatrixRow> = useMemo(() => {
    const base: ColumnsType<MatrixRow> = [
      {
        title: "CDG",
        dataIndex: "cdgName",
        width: 220,
        fixed: "left",
      },
      {
        title: "Loại",
        dataIndex: "cdgLoai",
        width: 100,
        fixed: "left",
        render: (v) => (v ? <Tag>{v}</Tag> : "-"),
      },
      {
        title: "TS CDG",
        dataIndex: "cdgTrongSo",
        width: 100,
        fixed: "left",
        render: (v) => <Tag color="blue">{v}</Tag>,
      },
    ];

    const dynamic: ColumnsType<MatrixRow> = cos.map((co) => ({
      title: (
        <div>
          <div style={{ fontWeight: 600 }}>{co.code ?? co.maCO}</div>
          <div style={{ fontSize: 12, color: "#888" }}>
            {co.noiDungChuanDauRa}
          </div>
        </div>
      ),
      dataIndex: co.maCO,
      width: 150,
      render: (_value: string | null | undefined, row: MatrixRow) => {
        const key = buildCellKey(row.maCDG, co.maCO);
        const raw = draftValues[key];
        const current = raw != null && raw !== "" ? Number(raw) : null;

        // Đã thay thế InputNumber bằng text tĩnh, giữ nguyên width để không vỡ layout
        return (
          <div style={{ width: 100, fontWeight: current ? 500 : 400, color: current ? '#000' : '#bfbfbf' }}>
            {current !== null ? current : "-"}
          </div>
        );
      },
    }));

    return [...base, ...dynamic];
  }, [cos, draftValues]);

  const hocPhanOptions = hocPhans.map((hp) => ({
    label: `${hp.tenHocPhan} (${hp.maHocPhan})`,
    value: hp.maHocPhan,
  }));

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 420 }}
          placeholder="Chọn học phần"
          options={hocPhanOptions}
          value={maHocPhan}
          onChange={(value) => {
            initializedKeyRef.current = null;
            setMaHocPhan(value);
          }}
          showSearch
          optionFilterProp="label"
        />
        {/* Đã xóa nút LƯU ở đây */}
      </Space>

      <Table
        rowKey="key"
        loading={isLoading}
        columns={columns}
        dataSource={maHocPhan ? rows : []}
        scroll={{ x: 1400 }}
        pagination={false}
        bordered
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}>
              <strong>Tổng cột</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1} />
            <Table.Summary.Cell index={2} />
            {cos.map((co, idx) => {
              const total = getColumnTotal(co.maCO);
              const isValid = total === 0 || total === 1;

              // Giữ nguyên logic báo Đỏ nếu tổng cột sai
              return (
                <Table.Summary.Cell key={co.maCO} index={idx + 3}>
                  <Tag color={isValid ? "green" : "red"}>{total}</Tag>
                </Table.Summary.Cell>
              );
            })}
          </Table.Summary.Row>
        )}
      />
    </div>
  );
}