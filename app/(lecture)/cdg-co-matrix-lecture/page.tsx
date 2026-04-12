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

type CachDanhGia = {
  maCDG: string;
  maDeCuong: string;
  tenThanhPhan: string;
  cachDanhGia?: string | null;
  trongSo: string;
  loai?: string | null;
};

type CO = {
  maCO: string;
  maDeCuong: string;
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
  cachDanhGias: CachDanhGia[];
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

async function listDeCuong(maHocPhan: string) {
  const res = await http.get<DeCuongChiTiet[]>("/de-cuong-chi-tiet", {
    params: { maHocPhan },
  });
  return res.data;
}

async function listCdgCoMatrix(maDeCuong: string) {
  const res = await http.get<CdgCoMatrixResponse>(
    `/de-cuong-chi-tiet/${maDeCuong}/cdg-co-mapping`
  );
  return res.data;
}

function buildCellKey(maCDG: string, maCO: string) {
  return `${maCDG}__${maCO}`;
}

export default function CdgCoMatrixPage() {
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
    queryKey: ["cdg-co-mapping", maDeCuong],
    queryFn: () => listCdgCoMatrix(maDeCuong!),
    enabled: !!maDeCuong,
  });

  const cdgs = matrixData?.cachDanhGias ?? [];
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
  }, [maDeCuong, matrixData]);

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
            <Table.Summary.Cell index={2} />
            {cos.map((co, idx) => {
              const total = getColumnTotal(co.maCO);
              const isValid = total === 0 || total === 1;

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
