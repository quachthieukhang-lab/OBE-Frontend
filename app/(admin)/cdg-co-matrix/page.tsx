"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, InputNumber, Select, Space, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

async function upsertCdgCoMapping(payload: {
  maHocPhan: string;
  maCDG: string;
  maCO: string;
  trongSo: string;
}) {
  const { maHocPhan, maCDG, maCO, trongSo } = payload;

  try {
    const res = await http.patch(
      `/hoc-phan/${maHocPhan}/cach-danh-gia/${maCDG}/co-mapping/${maCO}`,
      { trongSo }
    );
    return res.data;
  } catch {
    const res = await http.post(
      `/hoc-phan/${maHocPhan}/cach-danh-gia/${maCDG}/co-mapping`,
      { maCO, trongSo }
    );
    return res.data;
  }
}

async function deleteCdgCoMapping(payload: {
  maHocPhan: string;
  maCDG: string;
  maCO: string;
}) {
  const { maHocPhan, maCDG, maCO } = payload;
  await http.delete(
    `/hoc-phan/${maHocPhan}/cach-danh-gia/${maCDG}/co-mapping/${maCO}`
  );
}

function buildCellKey(maCDG: string, maCO: string) {
  return `${maCDG}__${maCO}`;
}

export default function CdgCoMatrixPage() {
  const qc = useQueryClient();
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
  const mappings = matrixData?.mappings ?? [];

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

  const validateColumnTotals = () => {
    const invalidColumns: Array<{
      maCO: string;
      label: string;
      total: number;
    }> = [];

    cos.forEach((co) => {
      const total = getColumnTotal(co.maCO);
      if (total !== 0 && total !== 1) {
        invalidColumns.push({
          maCO: co.maCO,
          label: co.code ?? co.maCO,
          total,
        });
      }
    });

    return invalidColumns;
  };

  const saveAllMut = useMutation({
    mutationFn: async () => {
      if (!maHocPhan) return;

      const invalidColumns = validateColumnTotals();
      if (invalidColumns.length > 0) {
        throw new Error(
          invalidColumns.map((c) => `${c.label} = ${c.total}`).join(", ")
        );
      }

      const existingMap = new Map(
        mappings.map((m) => [buildCellKey(m.maCDG, m.maCO), String(m.trongSo)])
      );

      const allKeys = new Set([
        ...Object.keys(draftValues),
        ...Array.from(existingMap.keys()),
      ]);

      for (const key of allKeys) {
        const [maCDG, maCO] = key.split("__");
        const nextValue = draftValues[key];
        const oldValue = existingMap.get(key);

        if ((nextValue ?? undefined) === (oldValue ?? undefined)) {
          continue;
        }

        if (nextValue == null || nextValue === "") {
          if (oldValue != null) {
            await deleteCdgCoMapping({
              maHocPhan,
              maCDG,
              maCO,
            });
          }
          continue;
        }

        await upsertCdgCoMapping({
          maHocPhan,
          maCDG,
          maCO,
          trongSo: nextValue,
        });
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cdg-co-mapping", maHocPhan] });
      message.success("Lưu thành công");
    },
    onError: (error: any) => {
      message.error(error?.message ?? "Lưu thất bại");
    },
  });

  const handleSaveAll = () => {
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
          <InputNumber
            min={0}
            max={1}
            step={0.01}
            value={current}
            style={{ width: 100 }}
            onChange={(v) => {
              setDraftValues((prev) => {
                const next = { ...prev };

                if (v === null || v === undefined || v === "") {
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

        <Button
          type="primary"
          onClick={handleSaveAll}
          loading={saveAllMut.isPending}
          disabled={!maHocPhan}
        >
          Lưu
        </Button>
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