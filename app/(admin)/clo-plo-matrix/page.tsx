"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Button, InputNumber, Select, Space, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

async function upsertCloPloMapping(payload: {
  maDeCuong: string;
  maCLO: string;
  maPLO: string;
  trongSo: string;
  maSoNganh: string;
  khoa: number;
}) {
  const { maDeCuong, maCLO, maPLO, trongSo, maSoNganh, khoa } = payload;
  const params = { maSoNganh, khoa };

  try {
    const res = await http.patch(
      `/de-cuong-chi-tiet/${maDeCuong}/clo/${maCLO}/plo-mapping/${maPLO}`,
      { trongSo },
      { params }
    );
    return res.data;
  } catch {
    const res = await http.post(
      `/de-cuong-chi-tiet/${maDeCuong}/clo/${maCLO}/plo-mapping`,
      { maPLO, trongSo },
      { params }
    );
    return res.data;
  }
}

async function deleteCloPloMapping(payload: {
  maDeCuong: string;
  maCLO: string;
  maPLO: string;
  maSoNganh: string;
  khoa: number;
}) {
  const { maDeCuong, maCLO, maPLO, maSoNganh, khoa } = payload;
  await http.delete(`/de-cuong-chi-tiet/${maDeCuong}/clo/${maCLO}/plo-mapping/${maPLO}`, {
    params: { maSoNganh, khoa },
  });
}

function buildCellKey(maCLO: string, maPLO: string) {
  return `${maCLO}__${maPLO}`;
}

export default function CloPloMatrixPage() {
  const qc = useQueryClient();
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
  const mappings = matrixData?.mappings ?? [];
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

  const validateColumnTotals = () => {
    const invalidColumns: Array<{
      maPLO: string;
      label: string;
      total: number;
    }> = [];

    plos.forEach((plo) => {
      const total = getColumnTotal(plo.maPLO);
      if (total !== 0 && total !== 1) {
        invalidColumns.push({
          maPLO: plo.maPLO,
          label: plo.code ?? plo.maPLO,
          total,
        });
      }
    });

    return invalidColumns;
  };

  const saveAllMut = useMutation({
    mutationFn: async () => {
      if (!maDeCuong || !maSoNganh || khoa == null) {
        throw new Error("Chọn chương trình đào tạo và khóa để lưu (bắt buộc theo phiên bản CTĐT)");
      }

      const invalidColumns = validateColumnTotals();
      if (invalidColumns.length > 0) {
        throw new Error(
          invalidColumns.map((c) => `${c.label} = ${c.total}`).join(", ")
        );
      }

      const existingMap = new Map(
        mappings.map((m) => [buildCellKey(m.maCLO, m.maPLO), String(m.trongSo)])
      );

      const allKeys = new Set([
        ...Object.keys(draftValues),
        ...Array.from(existingMap.keys()),
      ]);

      for (const key of allKeys) {
        const [maCLO, maPLO] = key.split("__");
        const nextValue = draftValues[key];
        const oldValue = existingMap.get(key);

        if ((nextValue ?? undefined) === (oldValue ?? undefined)) {
          continue;
        }

        if (nextValue == null || nextValue === "") {
          if (oldValue != null) {
            await deleteCloPloMapping({
              maDeCuong,
              maCLO,
              maPLO,
              maSoNganh,
              khoa,
            });
          }
          continue;
        }

        await upsertCloPloMapping({
          maDeCuong,
          maCLO,
          maPLO,
          trongSo: nextValue,
          maSoNganh,
          khoa,
        });
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: matrixQueryKey });
      message.success("Lưu thành công");
    },
    onError: (error: unknown) => {
      const err = error as { message?: string };
      message.error(err?.message ?? "Lưu thất bại");
    },
  });

  const handleSaveAll = () => {
    if (!maDeCuong || !maSoNganh || khoa == null) {
      message.warning("Chọn đề cương, chương trình (ngành) và khóa trước khi lưu.");
      return;
    }

    const invalidColumns = validateColumnTotals();

    if (invalidColumns.length > 0) {
      message.error(
        `Các cột chưa hợp lệ: ${invalidColumns
          .map((c) => `${c.label} = ${c.total}`)
          .join(", ")}`
      );
      return;
    }

    saveAllMut.mutate();
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
          <InputNumber
            min={0}
            max={1}
            step={0.01}
            value={current}
            style={{ width: 100 }}
            onChange={(v) => {
              setDraftValues((prev) => {
                const next = { ...prev };

                if (v === null || v === undefined) {
                  delete next[key];
                } else {
                  next[key] = String(v);
                }

                return next;
              });
            }}
          />
        );
      },
    }));

    return [...base, ...dynamic];
  }, [plos, draftValues]);

  const hocPhanOptions = hocPhans.map((hp) => ({
    label: `${hp.tenHocPhan} (${hp.maHocPhan})`,
    value: hp.maHocPhan,
  }));

  const canSave = !!maDeCuong && !!maSoNganh && khoa != null;

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

          <Button type="primary" onClick={handleSaveAll} loading={saveAllMut.isPending} disabled={!canSave}>
            Lưu
          </Button>
        </Space>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Chọn đề cương trước, sau đó chọn ngành + khóa để lọc PLO/mapping theo phiên bản CTĐT.{" "}
          <strong>Lưu</strong> bắt buộc chọn đủ đề cương + ngành + khóa.
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
