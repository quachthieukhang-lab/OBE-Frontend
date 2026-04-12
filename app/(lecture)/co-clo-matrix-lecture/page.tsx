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

type DeCuongChiTiet = {
  maDeCuong: string;
  maHocPhan: string;
  phienBan: string;
  trangThai: "draft" | "active" | "archived";
  ngayApDung?: string | null;
};

type CLO = {
  maCLO: string;
  maDeCuong: string;
  code?: string | null;
  noiDungChuanDauRa: string;
};

type CO = {
  maCO: string;
  maDeCuong: string;
  code?: string | null;
  noiDungChuanDauRa: string;
};

type CloCoMapping = {
  maCLO: string;
  maCO: string;
  trongSo: string;
  ghiChu?: string | null;
};

type CloCoMatrixResponse = {
  clos: CLO[];
  cos: CO[];
  mappings: CloCoMapping[];
};

type MatrixRow = {
  key: string;
  maCO: string;
  coCode?: string | null;
  coText: string;
  [key: string]: string | null | undefined;
};

async function listHocPhan() {
  const res = await http.get<HocPhan[]>("/hoc-phan");
  return res.data;
}

async function listDeCuong(maHocPhan: string) {
  const res = await http.get<DeCuongChiTiet[]>("/de-cuong-chi-tiet", {
    params: { maHocPhan },
  });
  return res.data;
}

async function listCloCoMatrix(maDeCuong: string) {
  const res = await http.get<CloCoMatrixResponse>(
    `/de-cuong-chi-tiet/${maDeCuong}/clo-co-mapping`
  );
  return res.data;
}

function buildCellKey(maCO: string, maCLO: string) {
  return `${maCO}__${maCLO}`;
}

export default function CloCoMatrixPage() {
  const [maHocPhan, setMaHocPhan] = useState<string>();
  const [maDeCuong, setMaDeCuong] = useState<string>();
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});

  const { data: hocPhans = [] } = useQuery({
    queryKey: ["hoc-phan"],
    queryFn: listHocPhan,
  });

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

  const { data: matrixData, isLoading } = useQuery({
    queryKey: ["clo-co-mapping", maDeCuong],
    queryFn: () => listCloCoMatrix(maDeCuong!),
    enabled: !!maDeCuong,
  });

  const clos = matrixData?.clos ?? [];
  const cos = matrixData?.cos ?? [];

  const initializedKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (!maDeCuong) {
      setDraftValues({});
      initializedKeyRef.current = null;
      return;
    }

    if (!matrixData) return;

    const mappingsList = matrixData.mappings ?? [];

    const initKey = JSON.stringify(
      mappingsList.map((m) => ({
        maCO: m.maCO,
        maCLO: m.maCLO,
        trongSo: String(m.trongSo),
      }))
    );

    if (initializedKeyRef.current === initKey) return;

    const next: Record<string, string> = {};
    mappingsList.forEach((m) => {
      next[buildCellKey(m.maCO, m.maCLO)] = String(m.trongSo);
    });

    initializedKeyRef.current = initKey;
    setDraftValues(next);
  }, [maDeCuong, matrixData]);

  const rows: MatrixRow[] = useMemo(() => {
    return cos.map((co) => {
      const row: MatrixRow = {
        key: co.maCO,
        maCO: co.maCO,
        coCode: co.code,
        coText: co.noiDungChuanDauRa,
      };

      clos.forEach((clo) => {
        const key = buildCellKey(co.maCO, clo.maCLO);
        row[clo.maCLO] = draftValues[key] ?? null;
      });

      return row;
    });
  }, [cos, clos, draftValues]);

  const getColumnTotal = (maCLO: string) => {
    let total = 0;

    cos.forEach((co) => {
      const raw = draftValues[buildCellKey(co.maCO, maCLO)];
      if (raw != null && raw !== "") {
        total += Number(raw);
      }
    });

    return Number(total.toFixed(4));
  };

  const columns: ColumnsType<MatrixRow> = useMemo(() => {
    const base: ColumnsType<MatrixRow> = [
      {
        title: "CO",
        dataIndex: "coCode",
        width: 100,
        fixed: "left",
        render: (v) => (v ? <Tag>{v}</Tag> : "-"),
      },
      {
        title: "Nội dung CO",
        dataIndex: "coText",
        width: 320,
        fixed: "left",
        ellipsis: false,
      },
    ];

    const dynamic: ColumnsType<MatrixRow> = clos.map((clo) => ({
      title: (
        <div>
          <div style={{ fontWeight: 600 }}>{clo.code ?? clo.maCLO}</div>
          <div style={{ fontSize: 12, color: "#888" }}>
            {clo.noiDungChuanDauRa}
          </div>
        </div>
      ),
      dataIndex: clo.maCLO,
      width: 150,
      render: (_value: string | null | undefined, row: MatrixRow) => {
        const key = buildCellKey(row.maCO, clo.maCLO);
        const raw = draftValues[key];
        const current = raw != null && raw !== "" ? Number(raw) : null;

        return (
          <div style={{ width: 100, fontWeight: current ? 500 : 400, color: current ? '#000' : '#bfbfbf' }}>
            {current !== null ? current : "-"}
          </div>
        );
      },
    }));

    return [...base, ...dynamic];
  }, [clos, draftValues]);

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
            setMaDeCuong(undefined);
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
            initializedKeyRef.current = null;
            setMaDeCuong(v);
          }}
          disabled={!maHocPhan || deCuongs.length === 0}
          showSearch
          optionFilterProp="label"
        />
      </Space>

      <Table
        rowKey="key"
        loading={isLoading}
        columns={columns}
        dataSource={maDeCuong ? rows : []}
        scroll={{ x: 1400 }}
        pagination={false}
        bordered
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}>
              <strong>Tổng cột</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1} />
            {clos.map((clo, idx) => {
              const total = getColumnTotal(clo.maCLO);
              const isValid = total === 0 || total === 1;

              return (
                <Table.Summary.Cell key={clo.maCLO} index={idx + 2}>
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
