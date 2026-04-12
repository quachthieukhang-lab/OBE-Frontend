"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/api/http";
import { listChuongTrinhDaoTao } from "@/features/chuong-trinh-dao-tao/api";
import type { ChuongTrinhDaoTao } from "@/features/chuong-trinh-dao-tao/types";
import { listProgramCohorts } from "@/features/chuong-trinh-nien-khoa/api";
import type { ChuongTrinhNienKhoa } from "@/features/chuong-trinh-nien-khoa/types";

const { Text } = Typography;

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

type PLO = {
  maPLO: string;
  maSoNganh: string;
  code?: string | null;
  noiDungChuanDauRa: string;
  khoa?: number | null;
};

type CloPloMapping = {
  maCLO: string;
  maPLO: string;
  trongSo: string;
  ghiChu?: string | null;
};

type CloPloMatrixResponse = {
  clos: CLO[];
  plos: PLO[];
  mappings: CloPloMapping[];
};

type MatrixRow = {
  key: string;
  maCLO: string;
  cloCode?: string | null;
  cloText: string;
  [key: string]: string | null | undefined;
};

function cohortQuery(maSoNganh?: string, khoa?: number) {
  if (maSoNganh && khoa != null) return { maSoNganh, khoa };
  return undefined;
}

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

async function listCloPloMatrix(maDeCuong: string, maSoNganh?: string, khoa?: number) {
  const params = cohortQuery(maSoNganh, khoa);
  const res = await http.get<CloPloMatrixResponse>(`/de-cuong-chi-tiet/${maDeCuong}/clo-plo-mapping`, {
    params,
  });
  return res.data;
}

function buildCellKey(maCLO: string, maPLO: string) {
  return `${maCLO}__${maPLO}`;
}

export default function CloPloMatrixLecturePage() {
  const [maHocPhan, setMaHocPhan] = useState<string>();
  const [maDeCuong, setMaDeCuong] = useState<string>();
  const [maSoNganh, setMaSoNganh] = useState<string>();
  const [khoa, setKhoa] = useState<number>();
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

  const { data: programs = [] } = useQuery({
    queryKey: ["chuong-trinh-dao-tao"],
    queryFn: () => listChuongTrinhDaoTao({}),
  });

  const { data: cohorts = [] } = useQuery({
    queryKey: ["chuong-trinh-nien-khoa", maSoNganh],
    queryFn: () => listProgramCohorts(maSoNganh!),
    enabled: !!maSoNganh,
  });

  const programOptions = useMemo(
    () =>
      programs.map((p: ChuongTrinhDaoTao) => ({
        label: `${p.tenTiengViet} (${p.maSoNganh})`,
        value: p.maSoNganh,
      })),
    [programs]
  );

  const cohortOptions = useMemo(
    () =>
      cohorts.map((c: ChuongTrinhNienKhoa) => ({
        label: `K${c.khoa}${c.phienBan ? ` — ${c.phienBan}` : ""}`,
        value: c.khoa,
      })),
    [cohorts]
  );

  const matrixQueryKey = useMemo(
    () => ["clo-plo-mapping", maDeCuong, maSoNganh ?? null, khoa ?? null] as const,
    [maDeCuong, maSoNganh, khoa]
  );

  const { data: matrixData, isLoading } = useQuery({
    queryKey: matrixQueryKey,
    queryFn: () => listCloPloMatrix(maDeCuong!, maSoNganh, khoa),
    enabled: !!maDeCuong,
  });

  const clos = matrixData?.clos ?? [];
  const plos = matrixData?.plos ?? [];

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
        maCLO: m.maCLO,
        maPLO: m.maPLO,
        trongSo: String(m.trongSo),
      }))
    );

    if (initializedKeyRef.current === initKey) return;

    const next: Record<string, string> = {};
    mappingsList.forEach((m) => {
      next[buildCellKey(m.maCLO, m.maPLO)] = String(m.trongSo);
    });

    initializedKeyRef.current = initKey;
    setDraftValues(next);
  }, [maDeCuong, maSoNganh, khoa, matrixData]);

  const rows: MatrixRow[] = useMemo(() => {
    return clos.map((clo) => {
      const row: MatrixRow = {
        key: clo.maCLO,
        maCLO: clo.maCLO,
        cloCode: clo.code,
        cloText: clo.noiDungChuanDauRa,
      };

      plos.forEach((plo) => {
        const key = buildCellKey(clo.maCLO, plo.maPLO);
        row[plo.maPLO] = draftValues[key] ?? null;
      });

      return row;
    });
  }, [clos, plos, draftValues]);

  const getColumnTotal = (maPLO: string) => {
    let total = 0;

    clos.forEach((clo) => {
      const raw = draftValues[buildCellKey(clo.maCLO, maPLO)];
      if (raw != null && raw !== "") {
        total += Number(raw);
      }
    });

    return Number(total.toFixed(4));
  };

  const columns: ColumnsType<MatrixRow> = useMemo(() => {
    const base: ColumnsType<MatrixRow> = [
      {
        title: "CLO",
        dataIndex: "cloCode",
        width: 100,
        fixed: "left",
        render: (v) => (v ? <Tag>{v}</Tag> : "-"),
      },
      {
        title: "Nội dung CLO",
        dataIndex: "cloText",
        width: 320,
        fixed: "left",
        ellipsis: false,
      },
    ];

    const dynamic: ColumnsType<MatrixRow> = plos.map((plo) => ({
      title: (
        <div>
          <div style={{ fontWeight: 600 }}>{plo.code ?? plo.maPLO}</div>
          <div style={{ fontSize: 12, color: "#888" }}>
            {plo.noiDungChuanDauRa}
          </div>
        </div>
      ),
      dataIndex: plo.maPLO,
      width: 150,
      render: (_value: string | null | undefined, row: MatrixRow) => {
        const key = buildCellKey(row.maCLO, plo.maPLO);
        const raw = draftValues[key];
        const current = raw != null && raw !== "" ? Number(raw) : null;

        return (
          <div
            style={{
              width: 100,
              fontWeight: current ? 500 : 400,
              color: current ? "#000" : "#bfbfbf",
            }}
          >
            {current !== null ? current : "-"}
          </div>
        );
      },
    }));

    return [...base, ...dynamic];
  }, [plos, draftValues]);

  const hocPhanOptions = hocPhans.map((hp) => ({
    label: `${hp.tenHocPhan} (${hp.maHocPhan})`,
    value: hp.maHocPhan,
  }));

  return (
    <div style={{ padding: 24 }}>
      <Space orientation="vertical" size={12} style={{ width: "100%", marginBottom: 16 }}>
        <Space wrap align="start">
          <Select
            style={{ width: 420 }}
            placeholder="Chọn học phần"
            options={hocPhanOptions}
            value={maHocPhan}
            onChange={(value) => {
              initializedKeyRef.current = null;
              setMaHocPhan(value);
              setMaDeCuong(undefined);
              setMaSoNganh(undefined);
              setKhoa(undefined);
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

          <Select
            style={{ width: 360 }}
            placeholder="Chương trình (ngành) — lọc theo phiên bản"
            options={programOptions}
            value={maSoNganh}
            allowClear
            onChange={(v) => {
              initializedKeyRef.current = null;
              setMaSoNganh(v);
              setKhoa(undefined);
            }}
            showSearch
            optionFilterProp="label"
            disabled={!maDeCuong}
          />

          <Select
            style={{ width: 220 }}
            placeholder="Khóa (K)"
            options={cohortOptions}
            value={khoa}
            allowClear
            onChange={(v) => {
              initializedKeyRef.current = null;
              setKhoa(v ?? undefined);
            }}
            showSearch
            optionFilterProp="label"
            disabled={!maSoNganh}
          />
        </Space>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Chọn đề cương trước, sau đó chọn đủ <strong>ngành + khóa</strong> để lọc PLO/mapping theo phiên bản CTĐT (read-only).
        </Text>
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
            {plos.map((plo, idx) => {
              const total = getColumnTotal(plo.maPLO);
              const isValid = total === 0 || total === 1;

              return (
                <Table.Summary.Cell key={plo.maPLO} index={idx + 2}>
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
